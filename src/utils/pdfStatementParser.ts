import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type {
    PVDRecord,
    PVDPolicy,
    AccountMovementRow,
    VerificationResult,
    ParsedPDFStatementResult
} from '../types';
import { POLICY_METADATA } from './mockData';

// Configure pdf.js worker locally from Vite bundle
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export type { VerificationResult, ParsedPDFStatementResult };

export interface ParsedToken {
    text: string;
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    confidence?: number;
}

const POLICY_ORDER = [
    'AERO1-UOB',
    'AERO2-UOB',
    'AERO3-UOB',
    'AERO1-TIS',
    'AERO2-TIS',
    'AERO3-TIS'
] as const;

function parseNumberToken(raw: string): number | null {
    // Support standard minus signs as well as legacy 2020-2021 PDF custom font encoding
    // where leading minus '-' is mapped to 'Y' or 'B' (e.g., "Y27.20", "Y1,784.23", "B13.88 %")
    const cleaned = raw
        .trim()
        .replace(/^[YB](?=\d)/, '-')
        .replace(/,/g, '')
        .replace(/%/g, '')
        .replace(/[–—]/g, '-')
        .trim();
    if (!cleaned || cleaned === '-' || cleaned === '.') return null;
    if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
    const val = parseFloat(cleaned);
    return Number.isFinite(val) ? val : null;
}

function normalizePolicyCode(rowText: string): string | null {
    const upper = rowText.toUpperCase().replace(/\s+/g, '');
    // Handle minor OCR confusions (AER01-U0B) and legacy 2020 font hyphen encoding (AERO1YUOB / AERO1BUOB)
    const normalized = upper
        .replace(/AER[O0]([123])[YB–—-]?(U[O0]B|T[I1]S)/g, 'AERO$1-$2')
        .replace(/AER[O0]([123])/g, 'AERO$1')
        .replace(/U[O0]B/g, 'UOB')
        .replace(/T[I1]S/g, 'TIS');

    for (const code of POLICY_ORDER) {
        const [prefix, mgr] = code.split('-');
        if (normalized.includes(`${prefix}-${mgr}`) || normalized.includes(`${prefix}${mgr}`)) {
            return code;
        }
    }
    return null;
}

function groupTokensIntoRows(tokens: ParsedToken[], yTolerance: number): ParsedToken[][] {
    if (tokens.length === 0) return [];
    const sorted = [...tokens].sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0);
    const rows: ParsedToken[][] = [];

    for (const tok of sorted) {
        const midY = (tok.y0 + tok.y1) / 2;
        const lastRow = rows[rows.length - 1];
        if (!lastRow) {
            rows.push([tok]);
            continue;
        }
        const rowMidY =
            lastRow.reduce((sum, t) => sum + (t.y0 + t.y1) / 2, 0) / lastRow.length;
        if (Math.abs(midY - rowMidY) <= yTolerance) {
            lastRow.push(tok);
        } else {
            rows.push([tok]);
        }
    }

    return rows.map((row) => row.sort((a, b) => a.x0 - b.x0));
}

/**
 * Merge separated minus signs (e.g. '-' followed closely by '27.20') and extract numeric values left-to-right.
 */
function extractNumericCellsFromRow(
    tokens: ParsedToken[],
    minX = 0
): { value: number; rawText: string; xMid: number }[] {
    const filtered = tokens.filter((t) => t.x0 >= minX);
    const merged: { text: string; xMid: number }[] = [];

    for (let i = 0; i < filtered.length; i++) {
        const cur = filtered[i].text.trim();
        const next = filtered[i + 1]?.text.trim();

        if (
            (cur === '-' || cur === '–' || cur === '—' || cur === 'Y' || cur === 'B') &&
            next &&
            /^\d[\d,]*(\.\d+)?%?$/.test(next)
        ) {
            const xMid = (filtered[i + 1].x0 + filtered[i + 1].x1) / 2;
            merged.push({ text: `-${next}`, xMid });
            i++;
            continue;
        }
        merged.push({
            text: cur,
            xMid: (filtered[i].x0 + filtered[i].x1) / 2
        });
    }

    const results: { value: number; rawText: string; xMid: number }[] = [];
    for (const item of merged) {
        const parsed = parseNumberToken(item.text);
        if (parsed !== null) {
            results.push({ value: parsed, rawText: item.text, xMid: item.xMid });
        }
    }
    return results;
}

/**
 * Anchor policy row extraction on the 4-decimal NAV & Units columns so stray OCR tokens
 * in the Thai description column cannot shift numeric columns.
 */
function extractPolicyNumbersFromRow(row: ParsedToken[], pageWidth: number): number[] {
    const codeTokIdx = row.findIndex(
        (t) => normalizePolicyCode(t.text) !== null || /AERO|UOB|TIS/i.test(t.text)
    );
    const minX = Math.max(
        pageWidth * 0.36,
        codeTokIdx >= 0 ? row[codeTokIdx].x1 - 5 : pageWidth * 0.36
    );
    const cells = extractNumericCellsFromRow(row, minX);
    if (cells.length < 5) return cells.map((c) => c.value);

    // Find the first index where two consecutive numbers look like 4-decimal NAV and Units
    const fourDecIdx = cells.findIndex(
        (c, idx) =>
            idx + 4 < cells.length &&
            /\.\d{3,4}$/.test(c.rawText.replace(/,/g, '')) &&
            /\.\d{3,4}$/.test(cells[idx + 1].rawText.replace(/,/g, ''))
    );

    const startIdx = fourDecIdx >= 0 ? fourDecIdx : 0;
    return cells.slice(startIdx).map((c) => c.value);
}

function buildMovementRow(nums: number[]): AccountMovementRow | undefined {
    if (nums.length < 5) return undefined;
    // Take the rightmost 5 numeric columns in left-to-right order:
    // [memberContribution, memberEarnings, employerContribution, employerEarnings, total]
    const cols = nums.slice(-5);
    return {
        memberContribution: Number(cols[0].toFixed(2)),
        memberEarnings: Number(cols[1].toFixed(2)),
        employerContribution: Number(cols[2].toFixed(2)),
        employerEarnings: Number(cols[3].toFixed(2)),
        total: Number(cols[4].toFixed(2))
    };
}

function verifyPVDRecordMath(record: PVDRecord, sourceMode: 'text-layer' | 'ocr-image'): VerificationResult {
    const checks: { label: string; passed: boolean; detail: string }[] = [];
    const warnings: string[] = [];

    // Check 1: Member + AEROTHAI Portions = Total Balance
    const calcMember = Number((record.memberContribution + record.memberEarnings).toFixed(2));
    const calcEmployer = Number((record.employerContribution + record.employerEarnings).toFixed(2));
    const calcTotal = Number((calcMember + calcEmployer).toFixed(2));
    const diffTotal = Math.abs(calcTotal - record.totalBalance);
    const totalMatches = record.totalBalance > 0 && diffTotal <= 0.1;
    checks.push({
        label: 'Member + AEROTHAI = Total Balance',
        passed: totalMatches,
        detail: totalMatches
            ? `฿${calcTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} verified`
            : `Calculated ฿${calcTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} vs Total ฿${record.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    });
    if (!totalMatches) {
        warnings.push('Ending Total Balance does not equal Member + AEROTHAI portions — please verify the movement table numbers.');
    }

    // Check 2: Previous Year + YTD = Ending Balance
    if (record.prevYear && record.ytd) {
        const expectedTotal = Number((record.prevYear.total + record.ytd.total).toFixed(2));
        const diffYtd = Math.abs(expectedTotal - record.totalBalance);
        const ytdMatches = diffYtd <= 0.15;
        checks.push({
            label: 'Prev Year + YTD Movement = Ending Balance',
            passed: ytdMatches,
            detail: ytdMatches
                ? `฿${record.prevYear.total.toLocaleString('en-US', { minimumFractionDigits: 2 })} + ฿${record.ytd.total.toLocaleString('en-US', { minimumFractionDigits: 2 })} = ฿${record.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                : `Prev + YTD = ฿${expectedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} vs Ending ฿${record.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        });
        if (!ytdMatches) {
            warnings.push('Previous Year + YTD sum differs slightly from Ending Balance.');
        }
    } else {
        warnings.push('Could not auto-detect both Previous Year and YTD movement rows.');
    }

    // Check 3: Policies Market Value Sum vs Total Balance
    const activePolicies = (record.policies || []).filter((p) => p.units > 0 || p.planAllocation > 0);
    if (activePolicies.length > 0) {
        const policyMarketSum = activePolicies.reduce((s, p) => s + p.nav * p.units, 0);
        const diffPol = Math.abs(policyMarketSum - record.totalBalance);
        // Allow small rounding difference from 4-decimal NAV/Units
        const polMatches = record.totalBalance > 0 && diffPol <= Math.max(50, record.totalBalance * 0.002);
        checks.push({
            label: `${activePolicies.length} Sub-Fund Policies (NAV × Units)`,
            passed: polMatches,
            detail: polMatches
                ? `฿${policyMarketSum.toLocaleString('en-US', { minimumFractionDigits: 2 })} matches Total Balance`
                : `Policies sum ฿${policyMarketSum.toLocaleString('en-US', { minimumFractionDigits: 2 })} vs Total ฿${record.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        });
        if (!polMatches) {
            warnings.push('Sub-fund NAV × Units sum differs from Total Balance — verify NAV or Units digits.');
        }
    } else {
        checks.push({
            label: 'Sub-Fund Policies Extracted',
            passed: false,
            detail: 'No AERO1/2/3 policy rows detected'
        });
        warnings.push('No sub-fund policies were detected automatically.');
    }

    return {
        isMathVerified: checks.every((c) => c.passed),
        sourceMode,
        checks,
        warnings
    };
}

function parseRowsToPVDRecord(
    rows: ParsedToken[][],
    pageWidth: number,
    pageHeight: number,
    sourceMode: 'text-layer' | 'ocr-image'
): { record: PVDRecord; verification: VerificationResult } {
    const fullText = rows.map((r) => r.map((t) => t.text).join(' ')).join('\n');

    // 1. Document No. (e.g., AERO/00164)
    const docMatch = fullText.match(/AERO\/\d{4,6}/i);
    const documentNo = docMatch ? docMatch[0].toUpperCase() : '';

    // 2. As of Date (prefer upper half of page DD/MM/25XX)
    let day = 30;
    let month = 9;
    let thaiYear = 2569;
    const upperText = rows
        .filter((r) => r[0] && r[0].y0 < pageHeight * 0.35)
        .map((r) => r.map((t) => t.text).join(' '))
        .join(' ');
    const dateMatch =
        upperText.match(/\b(\d{2})\/(\d{2})\/(25\d{2})\b/) ||
        fullText.match(/\b(\d{2})\/(\d{2})\/(25\d{2})\b/);

    if (dateMatch) {
        day = parseInt(dateMatch[1], 10);
        month = parseInt(dateMatch[2], 10);
        thaiYear = parseInt(dateMatch[3], 10);
    }

    const year = thaiYear - 543;
    const quarter = Math.min(4, Math.max(1, Math.ceil(month / 3)));
    const ddStr = String(day).padStart(2, '0');
    const mmStr = String(month).padStart(2, '0');
    const statementDate = `${year}-${mmStr}-${ddStr}`;
    const statementDateDisplay = `${ddStr}/${mmStr}/${year}`;
    const statementDateThai = `${ddStr}/${mmStr}/${thaiYear}`;

    // 3. Parse Sub-Fund Policy Rows (4 policies in 2020-2021 Q2, 6 policies in 2021 Q3+)
    const extractedPoliciesMap = new Map<string, PVDPolicy>();
    for (const row of rows) {
        const rowStr = row.map((t) => t.text).join(' ');
        const code = normalizePolicyCode(rowStr);
        if (!code || extractedPoliciesMap.has(code)) continue;

        const meta = POLICY_METADATA[code];
        if (!meta) continue;

        const nums = extractPolicyNumbersFromRow(row, pageWidth);
        if (nums.length >= 5) {
            extractedPoliciesMap.set(code, {
                code,
                nameTh: meta.nameTh.replace(/\s*\(.*\)$/, ''),
                manager: meta.manager,
                category: meta.category,
                nav: nums[0],
                units: nums[1],
                planAllocation: nums[2],
                actualPortion: nums[3],
                ytdReturn: nums[4],
                accReturn5Y: nums.length >= 6 ? nums[5] : null
            });
        }
    }

    const policies: PVDPolicy[] = Array.from(extractedPoliciesMap.values());

    // 4. Plan Code / Name (infer Plan 7 vs DIY from text or 40/60 Fixed Income + Mixed allocation)
    let planCode = 'DIY';
    let planName = 'DIY (Self-Directed Allocation)';
    let planNameTh = 'DIY สมาชิกเลือกสัดส่วนการลงทุนด้วยตนเอง (DIY)';

    const fi = policies.filter((p) => p.category === 'Fixed Income').reduce((s, p) => s + p.planAllocation, 0);
    const mx = policies.filter((p) => p.category === 'Mixed').reduce((s, p) => s + p.planAllocation, 0);
    const eq = policies.filter((p) => p.category === 'Foreign Equity').reduce((s, p) => s + p.planAllocation, 0);

    const isPlan7Text = /Plan\s*7|แผนที.*7|นโยบายตราสารหนี.*และนโยบายผสม/i.test(fullText);
    const isPlan7Alloc = !/DIY/i.test(fullText) && Math.round(fi) === 40 && Math.round(mx) === 60 && Math.round(eq) === 0;

    if (isPlan7Text || isPlan7Alloc) {
        planCode = 'Plan 7';
        planName = 'Plan 7 (Fixed Income 40%, Mixed 60%)';
        planNameTh = 'แผนที่ 7 นโยบายตราสารหนี้ 40% และนโยบายผสม 60%';
    } else if (policies.length > 0) {
        planCode = 'DIY';
        planName = `DIY (Fixed Income ${Math.round(fi)}%, Mixed ${Math.round(mx)}%, Foreign Equity ${Math.round(eq)}%)`;
    }

    // 5. Parse i-Return (%)
    let returnRate = 0;
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowStr = row.map((t) => t.text).join(' ');
        if (/i\s*[-–—YB]?\s*Return/i.test(rowStr) || /อัตราผลตอบแทนของสมาชิกกองทุน/i.test(rowStr)) {
            const candidateRows = [row];
            if (i > 0) candidateRows.push(rows[i - 1]);
            for (const cand of candidateRows) {
                if (
                    cand !== row &&
                    row[0] &&
                    cand[0] &&
                    Math.abs(row[0].y0 - cand[0].y0) > pageHeight * 0.025
                ) {
                    continue;
                }
                const nums = extractNumericCellsFromRow(cand, pageWidth * 0.65);
                if (nums.length > 0) {
                    returnRate = nums[nums.length - 1].value;
                    break;
                }
            }
            if (returnRate !== 0) break;
        }
    }

    // 6. Parse Lower Account Movement Table Rows
    let prevYear: AccountMovementRow | undefined;
    let ytd: AccountMovementRow | undefined;
    let endingRow: AccountMovementRow | undefined;

    const getMovementNums = (idx: number): number[] => {
        const curNums = extractNumericCellsFromRow(rows[idx], pageWidth * 0.35).map((n) => n.value);
        if (curNums.length >= 5) return curNums;
        if (idx > 0) {
            const prevRow = rows[idx - 1];
            const curY = rows[idx][0]?.y0 ?? 0;
            const prevY = prevRow[0]?.y0 ?? 0;
            if (Math.abs(curY - prevY) <= pageHeight * 0.025) {
                const prevNums = extractNumericCellsFromRow(prevRow, pageWidth * 0.35).map((n) => n.value);
                if (prevNums.length >= 5) return prevNums;
            }
        }
        return [];
    };

    for (let i = 0; i < rows.length; i++) {
        const y0 = rows[i][0]?.y0 ?? 0;
        if (y0 > pageHeight * 0.65) continue;

        const rowStr = rows[i].map((t) => t.text).join(' ');
        const isOldFund = /Old\s+Fund|เงินกองทุนเก่า|เงินประเดิม/i.test(rowStr);
        if (isOldFund) continue;

        if (/Balance\s+from\s+previous\s+year/i.test(rowStr) || rowStr.startsWith('ยอดยกมา')) {
            const nums = getMovementNums(i);
            if (nums.length >= 5) prevYear = buildMovementRow(nums);
        } else if (/Year\s+to\s+date\s+contribute/i.test(rowStr) || rowStr.startsWith('เงินกองทุนระหว่างปี')) {
            const nums = getMovementNums(i);
            if (nums.length >= 5) ytd = buildMovementRow(nums);
        } else if (/Total\s+balance\s+as\s+of\s+this\s+statement/i.test(rowStr) || rowStr.startsWith('ยอดยกไป')) {
            const nums = getMovementNums(i);
            if (nums.length >= 5) endingRow = buildMovementRow(nums);
        }
    }

    const memberContribution = endingRow?.memberContribution ?? 0;
    const memberEarnings = endingRow?.memberEarnings ?? 0;
    const employerContribution = endingRow?.employerContribution ?? 0;
    const employerEarnings = endingRow?.employerEarnings ?? 0;
    const totalMemberPortion = Number((memberContribution + memberEarnings).toFixed(2));
    const totalEmployerPortion = Number((employerContribution + employerEarnings).toFixed(2));
    const totalBalance = endingRow?.total ?? Number((totalMemberPortion + totalEmployerPortion).toFixed(2));

    const record: PVDRecord = {
        id: `${year}-Q${quarter}`,
        year,
        thaiYear,
        quarter,
        statementDate,
        statementDateDisplay,
        statementDateThai,
        documentNo,
        planCode,
        planName,
        planNameTh,
        returnRate,
        prevYear,
        ytd,
        memberContribution,
        memberEarnings,
        employerContribution,
        employerEarnings,
        totalMemberPortion,
        totalEmployerPortion,
        totalBalance,
        policies
    };

    const verification = verifyPVDRecordMath(record, sourceMode);
    return { record, verification };
}

async function renderPageToCanvas(
    page: pdfjsLib.PDFPageProxy,
    targetWidth: number
): Promise<HTMLCanvasElement> {
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = targetWidth / baseViewport.width;
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');
    if (ctx) {
        await page.render({ canvasContext: ctx, canvas, viewport }).promise;
    }
    return canvas;
}

/**
 * Parse an uploaded UOBAM x TISCO PVD Statement PDF (supports both text-layer and image-only PDFs).
 */
export async function parsePVDStatementPDF(
    file: File,
    onProgress?: (stage: string, pct: number) => void,
    options?: { forceOcr?: boolean }
): Promise<ParsedPDFStatementResult> {
    onProgress?.('Loading PDF document...', 10);
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    // 1. Inspect embedded text layer FIRST before rendering any heavy canvas
    onProgress?.('Inspecting PDF text layer...', 25);
    const textContent = await page.getTextContent();
    const baseViewport = page.getViewport({ scale: 1 });

    type PdfTextItemLike = (typeof textContent.items)[number] & {
        str: string;
        transform: number[];
        width: number;
        height: number;
    };
    const rawItems = textContent.items.filter(
        (item): item is PdfTextItemLike =>
            'str' in item && item.str.trim().length > 0
    );
    const combinedRawText = rawItems.map((i) => i.str).join(' ');
    const hasRichTextLayer =
        !options?.forceOcr &&
        rawItems.length >= 25 &&
        (/AERO[123]/i.test(combinedRawText) || /Balance\s+from\s+previous\s+year/i.test(combinedRawText));

    if (hasRichTextLayer) {
        // Render only a lightweight 900px preview image (saves ~6x memory & CPU on mobile/tablet)
        onProgress?.('Rendering statement preview...', 50);
        const previewCanvas = await renderPageToCanvas(page, 900);
        const previewDataUrl = previewCanvas.toDataURL('image/jpeg', 0.85);

        onProgress?.('Extracting structured text coordinates...', 80);
        const tokens: ParsedToken[] = rawItems.map((item) => {
            const x0 = item.transform[4];
            const yBottom = item.transform[5];
            const yTop = baseViewport.height - yBottom;
            return {
                text: item.str.trim(),
                x0,
                y0: yTop - (item.height || 8),
                x1: x0 + item.width,
                y1: yTop
            };
        });
        const rows = groupTokensIntoRows(tokens, 5);
        const { record, verification } = parseRowsToPVDRecord(
            rows,
            baseViewport.width,
            baseViewport.height,
            'text-layer'
        );
        onProgress?.('Complete!', 100);
        return { record, verification, previewDataUrl, rawRowsCount: rows.length };
    }

    // 2. Image-only / Scanned PDF fallback: render 2200px canvas & lazy-load Tesseract OCR
    onProgress?.('Rendering high-resolution page for OCR...', 35);
    const canvas = await renderPageToCanvas(page, 2200);

    const thumbCanvas = document.createElement('canvas');
    const thumbScale = 900 / canvas.width;
    thumbCanvas.width = 900;
    thumbCanvas.height = Math.round(canvas.height * thumbScale);
    const tCtx = thumbCanvas.getContext('2d');
    let previewDataUrl: string | undefined;
    if (tCtx) {
        tCtx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
        previewDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.85);
    }

    onProgress?.('Initializing on-device OCR engine...', 48);
    const { createWorker, PSM } = await import('tesseract.js');
    const worker = await createWorker('eng', undefined, {
        logger: (m) => {
            if (m.status === 'recognizing text') {
                onProgress?.('Reading numbers & tables from PDF...', Math.round(55 + m.progress * 38));
            }
        }
    });

    try {
        await worker.setParameters({
            tessedit_pageseg_mode: PSM.AUTO,
            preserve_interword_spaces: '1'
        });

        const { data } = await worker.recognize(canvas, {}, { blocks: true, text: true });
        const ocrTokens: ParsedToken[] = [];

        if (data.blocks) {
            for (const block of data.blocks) {
                for (const para of block.paragraphs) {
                    for (const line of para.lines) {
                        for (const word of line.words) {
                            if (word.text.trim()) {
                                ocrTokens.push({
                                    text: word.text.trim(),
                                    x0: word.bbox.x0,
                                    y0: word.bbox.y0,
                                    x1: word.bbox.x1,
                                    y1: word.bbox.y1,
                                    confidence: word.confidence
                                });
                            }
                        }
                    }
                }
            }
        }

        onProgress?.('Verifying accounting equations...', 95);
        const rows = groupTokensIntoRows(ocrTokens, Math.max(10, canvas.height * 0.0055));
        const { record, verification } = parseRowsToPVDRecord(
            rows,
            canvas.width,
            canvas.height,
            'ocr-image'
        );
        onProgress?.('Complete!', 100);
        return { record, verification, previewDataUrl, rawRowsCount: rows.length };
    } finally {
        await worker.terminate();
    }
}
