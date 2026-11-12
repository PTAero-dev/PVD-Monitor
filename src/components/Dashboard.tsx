import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    ReferenceLine,
    Legend
} from 'recharts';
import {
    Wallet,
    Building2,
    User,
    TrendingUp,
    Download,
    FileText,
    FileSpreadsheet,
    ChevronDown,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Sparkles,
    Award,
    PieChart as PieChartIcon,
    Calculator,
    Plus,
    Eye,
    FileUp,
    Loader2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import SummaryCard from './SummaryCard';
import HistoryList from './HistoryList';
import DataEntryForm from './DataEntryForm';
import PolicyAnalyticsView from './PolicyAnalyticsView';
import StatementInspector from './StatementInspector';
import WealthSimulator from './WealthSimulator';
import type { NavTab } from './Layout';
import { mockPVDHistory, defaultMemberProfile } from '../utils/mockData';
import {
    enrichPVDHistory,
    computeYearlySummaries,
    computeManagerComparison,
    sortPVDRecords
} from '../utils/analytics';
import {
    subscribeToPVDRecords,
    savePVDRecordToCloud,
    saveMultiplePVDRecordsToCloud,
    deletePVDRecordFromCloud,
    resetCloudToOfficialStatements,
    loadMemberProfileFromCloud
} from '../utils/firebase';
import { parsePVDStatementPDF, type VerificationResult } from '../utils/pdfStatementParser';
import type { PVDRecord, MemberProfile } from '../types';

interface DashboardProps {
    activeTab: NavTab;
    onTabChange: (tab: NavTab) => void;
    onSyncStatusChange: (status: 'synced' | 'syncing' | 'offline') => void;
    onLatestPeriodChange: (label: string) => void;
    manualSyncVersion: number;
}

const formatTHB = (val: number) =>
    new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(val);

const Dashboard: React.FC<DashboardProps> = ({
    activeTab,
    onTabChange,
    onSyncStatusChange,
    onLatestPeriodChange,
    manualSyncVersion
}) => {
    const [data, setData] = useState<PVDRecord[]>(() => {
        const saved = localStorage.getItem('pvd_data_v2');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length >= 27) {
                    return sortPVDRecords(parsed);
                }
            } catch {
                // fallback to official mockPVDHistory
            }
        }
        return sortPVDRecords(mockPVDHistory);
    });

    const [memberProfile, setMemberProfile] = useState<MemberProfile>(defaultMemberProfile);
    const [selectedStatementId, setSelectedStatementId] = useState<string>('2026-Q3');
    const [showModal, setShowModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState<PVDRecord | undefined>(undefined);
    const [pdfImportState, setPdfImportState] = useState<{
        isPdfImport: boolean;
        verification: VerificationResult;
        previewDataUrl?: string;
    } | null>(null);
    const [pdfParseProgress, setPdfParseProgress] = useState<{
        fileName: string;
        stage: string;
        pct: number;
    } | null>(null);
    const [pdfParseError, setPdfParseError] = useState<string | null>(null);
    const [showExportMenu, setShowExportMenu] = useState(false);

    // Chart state
    const [growthViewMode, setGrowthViewMode] = useState<'Quarterly' | 'Yearly'>('Quarterly');
    const [growthCompositionMode, setGrowthCompositionMode] = useState<'TotalVsPrincipal' | 'StackedPortions'>('TotalVsPrincipal');
    const [cashflowViewMode, setCashflowViewMode] = useState<'Quarterly' | 'Yearly'>('Quarterly');
    const [returnViewMode, setReturnViewMode] = useState<'YTD' | 'SingleQuarter' | 'YoY'>('YTD');
    const [zoomLevel, setZoomLevel] = useState<number>(48);

    const dashboardRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pdfInputRef = useRef<HTMLInputElement>(null);

    // Real-time Firebase Firestore subscription
    useEffect(() => {
        const unsub = subscribeToPVDRecords(
            (cloudRecords) => {
                if (cloudRecords && cloudRecords.length > 0) {
                    setData(cloudRecords);
                    localStorage.setItem('pvd_data_v2', JSON.stringify(cloudRecords));
                }
            },
            (status) => {
                onSyncStatusChange(status);
            }
        );

        loadMemberProfileFromCloud().then((prof) => {
            if (prof) setMemberProfile(prof);
        });

        return () => unsub();
    }, [manualSyncVersion, onSyncStatusChange]);

    // Enriched dataset with single-quarter cashflows, returns, manager split, and policy allocations
    const enrichedData = useMemo(() => enrichPVDHistory(data), [data]);
    const yearlySummaries = useMemo(() => computeYearlySummaries(enrichedData), [enrichedData]);

    const latestRecord = enrichedData[enrichedData.length - 1] || enrichedData[0];

    useEffect(() => {
        if (latestRecord?.periodLabel) {
            onLatestPeriodChange(latestRecord.periodLabel);
        }
    }, [latestRecord, onLatestPeriodChange]);

    const managerComp = useMemo(
        () => (latestRecord ? computeManagerComparison(latestRecord) : null),
        [latestRecord]
    );

    // Growth chart dataset
    const growthChartData = useMemo(() => {
        if (growthViewMode === 'Quarterly') {
            return enrichedData.map(r => ({
                label: r.shortPeriodLabel,
                fullLabel: `${r.periodLabel} (${r.statementDate})`,
                totalBalance: r.totalBalance,
                totalPrincipal: r.totalContributions,
                memberPrincipal: r.memberContribution,
                employerPrincipal: r.employerContribution,
                netProfit: r.totalEarnings,
                qoqPct: r.balanceQoQPct,
                iReturnPct: r.returnRate || 0
            }));
        } else {
            return yearlySummaries.map(ys => {
                const lastQRec = enrichedData.filter(r => r.year === ys.year).slice(-1)[0];
                return {
                    label: `${ys.year}`,
                    fullLabel: `Year ${ys.year} (${ys.thaiYear})`,
                    totalBalance: ys.endingBalance,
                    totalPrincipal: lastQRec?.totalContributions || 0,
                    memberPrincipal: lastQRec?.memberContribution || 0,
                    employerPrincipal: lastQRec?.employerContribution || 0,
                    netProfit: lastQRec?.totalEarnings || 0,
                    qoqPct: ys.netBalanceChangePct,
                    iReturnPct: ys.iReturnPct
                };
            });
        }
    }, [enrichedData, yearlySummaries, growthViewMode]);

    // Cashflow vs Market Gain dataset
    const cashflowChartData = useMemo(() => {
        if (cashflowViewMode === 'Quarterly') {
            return enrichedData.map(r => ({
                label: r.shortPeriodLabel,
                fullLabel: `${r.periodLabel} (${r.statementDate})`,
                newContributions: Number(r.qTotalContrib.toFixed(2)),
                memberContrib: Number(r.qMemberContrib.toFixed(2)),
                employerContrib: Number(r.qEmployerContrib.toFixed(2)),
                investmentGain: Number(r.qTotalEarnings.toFixed(2)),
                netChange: Number((r.qTotalContrib + r.qTotalEarnings).toFixed(2))
            }));
        } else {
            return yearlySummaries.map(ys => ({
                label: `${ys.year}`,
                fullLabel: `Year ${ys.year} (${ys.thaiYear})`,
                newContributions: Number(ys.totalContributionYTD.toFixed(2)),
                memberContrib: Number(ys.memberContributionYTD.toFixed(2)),
                employerContrib: Number(ys.employerContributionYTD.toFixed(2)),
                investmentGain: Number(ys.totalEarningsYTD.toFixed(2)),
                netChange: Number((ys.totalContributionYTD + ys.totalEarningsYTD).toFixed(2))
            }));
        }
    }, [enrichedData, yearlySummaries, cashflowViewMode]);

    // Return chart dataset
    const returnChartData = useMemo(() => {
        return enrichedData.map(r => {
            let val = 0;
            if (returnViewMode === 'YTD') {
                val = r.returnRate || 0;
            } else if (returnViewMode === 'SingleQuarter') {
                val = Number(r.qInvestmentReturnPct.toFixed(2));
            } else {
                val = Number((r.balanceYoYPct ?? 0).toFixed(2));
            }
            return {
                label: r.shortPeriodLabel,
                fullLabel: `${r.periodLabel} (${r.statementDate})`,
                value: val,
                ytdReturn: r.returnRate || 0,
                qReturn: Number(r.qInvestmentReturnPct.toFixed(2)),
                qGain: r.qTotalEarnings
            };
        });
    }, [enrichedData, returnViewMode]);

    // Handlers for CRUD + Cloud Sync
    const handleAddOrUpdateRecord = async (record: PVDRecord) => {
        const docId = record.id || `${record.year}-Q${record.quarter}`;
        const updatedRecord = { ...record, id: docId };

        setData(prev => {
            const exists = prev.some(r => r.id === docId || (r.year === record.year && r.quarter === record.quarter));
            const next = exists
                ? prev.map(r => (r.id === docId || (r.year === record.year && r.quarter === record.quarter) ? updatedRecord : r))
                : [...prev, updatedRecord];
            const sorted = sortPVDRecords(next);
            localStorage.setItem('pvd_data_v2', JSON.stringify(sorted));
            return sorted;
        });

        setShowModal(false);
        setEditingRecord(undefined);
        setPdfImportState(null);
        setSelectedStatementId(docId);

        try {
            onSyncStatusChange('syncing');
            await savePVDRecordToCloud(updatedRecord);
            onSyncStatusChange('synced');
        } catch (err) {
            console.warn('Cloud save failed, kept in localStorage:', err);
            onSyncStatusChange('offline');
        }
    };

    const handleDeleteRecord = async (id: string) => {
        setData(prev => {
            const next = prev.filter(r => r.id !== id);
            localStorage.setItem('pvd_data_v2', JSON.stringify(next));
            return next;
        });
        setShowModal(false);
        setEditingRecord(undefined);
        setPdfImportState(null);

        try {
            onSyncStatusChange('syncing');
            await deletePVDRecordFromCloud(id);
            onSyncStatusChange('synced');
        } catch (err) {
            console.warn('Cloud delete failed:', err);
            onSyncStatusChange('offline');
        }
    };

    const handleResetToOfficial = async () => {
        if (!window.confirm('Restore and verify all 27 official AEROTHAI PVD statements (2020 Q1 – 2026 Q3) in Firebase Cloud?')) {
            return;
        }
        try {
            onSyncStatusChange('syncing');
            const official = await resetCloudToOfficialStatements();
            setData(official);
            localStorage.setItem('pvd_data_v2', JSON.stringify(official));
            onSyncStatusChange('synced');
        } catch (err) {
            console.warn('Could not reset cloud statements:', err);
            setData(sortPVDRecords(mockPVDHistory));
            onSyncStatusChange('offline');
        }
    };

    const handleInspectStatement = (recordId: string) => {
        setSelectedStatementId(recordId);
        onTabChange('statement');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleExportPDF = async () => {
        if (!dashboardRef.current) return;
        setShowExportMenu(false);
        await new Promise(resolve => setTimeout(resolve, 200));

        try {
            const canvas = await html2canvas(dashboardRef.current, {
                scale: 2,
                backgroundColor: '#0f172a',
                useCORS: true,
                logging: false
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`AEROTHAI-PVD-Report-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Export PDF failed:', error);
            alert('Failed to export PDF.');
        }
    };

    const handleExportExcel = () => {
        setShowExportMenu(false);
        try {
            const summarySheet = XLSX.utils.json_to_sheet(
                enrichedData.map(item => ({
                    ID: item.id,
                    Date: item.statementDate,
                    Period: item.periodLabel,
                    DocumentNo: item.documentNo || '',
                    TotalBalance: item.totalBalance,
                    MemberContribution: item.memberContribution,
                    MemberEarnings: item.memberEarnings,
                    EmployerContribution: item.employerContribution,
                    EmployerEarnings: item.employerEarnings,
                    TotalMember: item.totalMemberPortion,
                    TotalEmployer: item.totalEmployerPortion,
                    TotalPrincipal: item.totalContributions,
                    TotalNetProfit: item.totalEarnings,
                    QuarterContrib: item.qTotalContrib,
                    QuarterEarnings: item.qTotalEarnings,
                    ReturnRate: `${item.returnRate}%`
                }))
            );

            // Second sheet: all sub-fund policies across all 27 quarters
            const policyRows: Record<string, any>[] = [];
            enrichedData.forEach(rec => {
                (rec.policies || []).forEach(pol => {
                    policyRows.push({
                        Period: rec.periodLabel,
                        StatementDate: rec.statementDate,
                        PolicyCode: pol.code,
                        Manager: pol.manager,
                        Category: pol.category,
                        PlanAllocationPct: pol.planAllocation,
                        ActualPortionPct: pol.actualPortion,
                        NAV: pol.nav,
                        Units: pol.units,
                        MarketValue: Number((pol.nav * pol.units).toFixed(2)),
                        YTDReturnPct: pol.ytdReturn
                    });
                });
            });
            const policySheet = XLSX.utils.json_to_sheet(policyRows);

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'PVD Statements (27 Qtrs)');
            XLSX.utils.book_append_sheet(workbook, policySheet, 'Sub-Fund NAV History');
            XLSX.writeFile(workbook, `AEROTHAI-PVD-Analytics-${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (error) {
            console.error('Export Excel failed:', error);
            alert('Failed to export Excel.');
        }
    };

    const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const jsonData = XLSX.utils.sheet_to_json(ws);

            const importedRecords: PVDRecord[] = jsonData
                .map((row: any) => {
                    let quarter = 0;
                    let year = 0;
                    if (row.Period) {
                        const parts = String(row.Period).replace('Q', '').split('/');
                        if (parts.length === 2) {
                            quarter = parseInt(parts[0]);
                            year = parseInt(parts[1]);
                        }
                    }
                    let returnRate = 0;
                    if (typeof row.ReturnRate === 'string') {
                        returnRate = parseFloat(row.ReturnRate.replace('%', ''));
                    } else if (typeof row.ReturnRate === 'number') {
                        returnRate = row.ReturnRate;
                    }
                    return {
                        id: `${year}-Q${quarter}`,
                        statementDate: row.Date || '',
                        quarter,
                        year,
                        totalBalance: Number(row.TotalBalance || 0),
                        memberContribution: Number(row.MemberContribution || 0),
                        memberEarnings: Number(row.MemberEarnings || 0),
                        employerContribution: Number(row.EmployerContribution || 0),
                        employerEarnings: Number(row.EmployerEarnings || 0),
                        totalMemberPortion: Number(row.TotalMember || 0),
                        totalEmployerPortion: Number(row.TotalEmployer || 0),
                        returnRate
                    };
                })
                .filter(r => r.quarter > 0 && r.year > 2000);

            if (importedRecords.length > 0) {
                let mergedList: PVDRecord[] = [];
                setData(prev => {
                    const map = new Map<string, PVDRecord>();
                    prev.forEach(r => map.set(`${r.year}-Q${r.quarter}`, r));
                    importedRecords.forEach(imp => {
                        const key = `${imp.year}-Q${imp.quarter}`;
                        const existing = map.get(key);
                        map.set(key, existing ? { ...existing, ...imp, id: existing.id } : imp);
                    });
                    mergedList = sortPVDRecords(Array.from(map.values()));
                    localStorage.setItem('pvd_data_v2', JSON.stringify(mergedList));
                    return mergedList;
                });

                try {
                    onSyncStatusChange('syncing');
                    await saveMultiplePVDRecordsToCloud(mergedList);
                    onSyncStatusChange('synced');
                } catch {
                    onSyncStatusChange('offline');
                }
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsBinaryString(file);
    };

    const handleImportPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setShowExportMenu(false);
        setPdfParseError(null);
        setPdfParseProgress({
            fileName: file.name,
            stage: 'Loading PDF statement...',
            pct: 5
        });

        try {
            const parsed = await parsePVDStatementPDF(file, (stage, pct) => {
                setPdfParseProgress({ fileName: file.name, stage, pct });
            });
            setEditingRecord(parsed.record);
            setPdfImportState({
                isPdfImport: true,
                verification: parsed.verification,
                previewDataUrl: parsed.previewDataUrl
            });
            setShowModal(true);
        } catch (err) {
            setPdfParseError(
                err instanceof Error ? err.message : 'Unable to parse PDF statement.'
            );
        } finally {
            setPdfParseProgress(null);
            if (pdfInputRef.current) pdfInputRef.current.value = '';
        }
    };

    const zoomBtnStyle: React.CSSProperties = {
        background: 'var(--color-surface)',
        color: 'var(--color-text-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: '6px',
        padding: '0.3rem 0.45rem',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    return (
        <div ref={dashboardRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Hidden Excel file input */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".xlsx, .xls"
                onChange={handleImportExcel}
            />

            {/* Hidden PDF Statement file input */}
            <input
                type="file"
                ref={pdfInputRef}
                style={{ display: 'none' }}
                accept=".pdf,application/pdf"
                onChange={handleImportPdf}
            />

            {/* PDF Parsing Progress Overlay */}
            {pdfParseProgress && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(2, 6, 23, 0.72)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 250,
                    padding: '1rem'
                }}>
                    <div className="card" style={{
                        width: '100%',
                        maxWidth: '420px',
                        padding: '1.5rem',
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.85rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <Loader2 size={22} color="var(--color-primary)" className="spin" />
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                                    Reading PVD PDF Statement
                                </div>
                                <div style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)', wordBreak: 'break-word' }}>
                                    {pdfParseProgress.fileName}
                                </div>
                            </div>
                        </div>
                        <div style={{
                            height: '8px',
                            borderRadius: '999px',
                            background: 'var(--color-bg-subtle)',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                height: '100%',
                                width: `${Math.max(5, Math.min(100, pdfParseProgress.pct))}%`,
                                background: 'var(--color-primary)',
                                transition: 'width 0.2s ease'
                            }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>
                            <span>{pdfParseProgress.stage}</span>
                            <strong>{pdfParseProgress.pct}%</strong>
                        </div>
                    </div>
                </div>
            )}

            {pdfParseError && (
                <div className="card" style={{
                    padding: '0.9rem 1.15rem',
                    border: '1px solid var(--color-danger)',
                    background: 'var(--color-danger-bg)',
                    color: 'var(--color-danger)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    fontSize: '0.84rem'
                }}>
                    <span>
                        <strong>PDF Import Error:</strong> {pdfParseError}
                    </span>
                    <button
                        onClick={() => setPdfParseError(null)}
                        style={{
                            padding: '0.3rem 0.65rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--color-danger)',
                            background: 'transparent',
                            color: 'var(--color-danger)',
                            fontSize: '0.75rem',
                            fontWeight: 600
                        }}
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* TAB 1: EXECUTIVE OVERVIEW */}
            {activeTab === 'overview' && latestRecord && (
                <>
                    {/* Executive Profile & Action Banner */}
                    <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                                    <span className="badge badge-primary">AEROTHAI Provident Fund</span>
                                    <span className="badge badge-success">
                                        {enrichedData.length} Verified Statements (2020 Q1 – {latestRecord.periodLabel})
                                    </span>
                                </div>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                                    Executive Portfolio Intelligence
                                </h2>
                                <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)' }}>
                                    Latest Valuation as of <strong>{latestRecord.statementDate}</strong> (B.E. {latestRecord.statementDateThai || `${latestRecord.thaiYear}`}) • Plan: {latestRecord.planCode || 'DIY'} ({latestRecord.planName})
                                </p>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => handleInspectStatement(latestRecord.id)}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        padding: '0.55rem 0.95rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                        background: 'var(--color-surface)',
                                        color: 'var(--color-text-main)',
                                        fontSize: '0.82rem',
                                        fontWeight: 600
                                    }}
                                >
                                    <Eye size={15} color="var(--color-primary)" />
                                    Inspect {latestRecord.periodLabel} Statement
                                </button>

                                {/* Export / Import Dropdown */}
                                <div style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => setShowExportMenu(!showExportMenu)}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            padding: '0.55rem 0.95rem',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--color-border)',
                                            background: 'var(--color-surface)',
                                            color: 'var(--color-text-main)',
                                            fontSize: '0.82rem',
                                            fontWeight: 600
                                        }}
                                    >
                                        <Download size={15} />
                                        Export / Import
                                        <ChevronDown size={13} />
                                    </button>
                                    {showExportMenu && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '115%',
                                            right: 0,
                                            background: 'var(--color-surface)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-md)',
                                            boxShadow: 'var(--shadow-lg)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            minWidth: '215px',
                                            zIndex: 100,
                                            overflow: 'hidden'
                                        }}>
                                            <button
                                                onClick={handleExportExcel}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.6rem',
                                                    padding: '0.7rem 1rem',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    color: 'var(--color-text-main)',
                                                    fontSize: '0.82rem',
                                                    textAlign: 'left',
                                                    borderBottom: '1px solid var(--color-border-subtle)'
                                                }}
                                            >
                                                <FileSpreadsheet size={15} color="#10b981" />
                                                Export Full Excel (.xlsx)
                                            </button>
                                            <button
                                                onClick={handleExportPDF}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.6rem',
                                                    padding: '0.7rem 1rem',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    color: 'var(--color-text-main)',
                                                    fontSize: '0.82rem',
                                                    textAlign: 'left',
                                                    borderBottom: '1px solid var(--color-border-subtle)'
                                                }}
                                            >
                                                <FileText size={15} color="var(--color-primary)" />
                                                Export PDF Snapshot
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowExportMenu(false);
                                                    fileInputRef.current?.click();
                                                }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.6rem',
                                                    padding: '0.7rem 1rem',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    color: 'var(--color-text-main)',
                                                    fontSize: '0.82rem',
                                                    textAlign: 'left',
                                                    borderBottom: '1px solid var(--color-border-subtle)'
                                                }}
                                            >
                                                <FileSpreadsheet size={15} color="#f59e0b" />
                                                Import Excel File
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowExportMenu(false);
                                                    pdfInputRef.current?.click();
                                                }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.6rem',
                                                    padding: '0.7rem 1rem',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    color: 'var(--color-text-main)',
                                                    fontSize: '0.82rem',
                                                    textAlign: 'left',
                                                    borderBottom: '1px solid var(--color-border-subtle)'
                                                }}
                                            >
                                                <FileUp size={15} color="#10b981" />
                                                Upload PDF Statement
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowExportMenu(false);
                                                    handleResetToOfficial();
                                                }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.6rem',
                                                    padding: '0.7rem 1rem',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    color: 'var(--color-text-secondary)',
                                                    fontSize: '0.8rem',
                                                    textAlign: 'left'
                                                }}
                                            >
                                                <RotateCcw size={14} />
                                                Verify / Restore 27 PDFs
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => pdfInputRef.current?.click()}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        padding: '0.55rem 0.95rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid rgba(16, 185, 129, 0.45)',
                                        background: 'rgba(16, 185, 129, 0.12)',
                                        color: 'var(--color-success)',
                                        fontSize: '0.82rem',
                                        fontWeight: 700
                                    }}
                                >
                                    <FileUp size={16} />
                                    Upload PDF
                                </button>

                                <button
                                    onClick={() => {
                                        setPdfImportState(null);
                                        setEditingRecord(undefined);
                                        setShowModal(true);
                                    }}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        padding: '0.55rem 1rem',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'var(--color-primary)',
                                        color: '#fff',
                                        fontSize: '0.82rem',
                                        fontWeight: 700
                                    }}
                                >
                                    <Plus size={16} />
                                    Add Quarter
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 4 Primary Executive KPI Cards */}
                    <div className="kpi-grid">
                        <SummaryCard
                            title="Total Portfolio Value"
                            subtitle={`Principal: ${formatTHB(latestRecord.totalContributions)} (${((latestRecord.totalContributions / latestRecord.totalBalance) * 100).toFixed(1)}%)`}
                            value={latestRecord.totalBalance}
                            icon={<Wallet size={20} />}
                            accentColor="#3b82f6"
                            subValue={latestRecord.totalEarnings}
                            subLabel="Cumulative Profit:"
                            qoq={latestRecord.balanceQoQPct}
                            yoy={latestRecord.balanceYoYPct}
                            progressPct={(latestRecord.totalContributions / latestRecord.totalBalance) * 100}
                        />
                        <SummaryCard
                            title="Member Portion (ส่วนสมาชิก)"
                            subtitle={`Principal: ${formatTHB(latestRecord.memberContribution)} (${((latestRecord.totalMemberPortion / latestRecord.totalBalance) * 100).toFixed(2)}% of Fund)`}
                            value={latestRecord.totalMemberPortion}
                            icon={<User size={20} />}
                            accentColor="#06b6d4"
                            subValue={latestRecord.memberEarnings}
                            subLabel="Member Earnings:"
                            footerNote={`+${formatTHB(latestRecord.qMemberContrib)} saved in ${latestRecord.periodLabel}`}
                            progressPct={(latestRecord.totalMemberPortion / latestRecord.totalBalance) * 100}
                        />
                        <SummaryCard
                            title="AEROTHAI Portion (ส่วนบริษัท)"
                            subtitle={`Principal: ${formatTHB(latestRecord.employerContribution)} (${((latestRecord.totalEmployerPortion / latestRecord.totalBalance) * 100).toFixed(2)}% of Fund)`}
                            value={latestRecord.totalEmployerPortion}
                            icon={<Building2 size={20} />}
                            accentColor="#6366f1"
                            subValue={latestRecord.employerEarnings}
                            subLabel="AEROTHAI Earnings:"
                            footerNote={`+${formatTHB(latestRecord.qEmployerContrib)} matched in ${latestRecord.periodLabel}`}
                            progressPct={(latestRecord.totalEmployerPortion / latestRecord.totalBalance) * 100}
                        />
                        <SummaryCard
                            title={`Portfolio i-Return (${latestRecord.year} YTD)`}
                            subtitle={`YTD Investment Gain: +${formatTHB((latestRecord.ytd?.memberEarnings || 0) + (latestRecord.ytd?.employerEarnings || 0))}`}
                            value={latestRecord.returnRate || 0}
                            isCurrency={false}
                            icon={<TrendingUp size={20} />}
                            accentColor="#10b981"
                            trend={latestRecord.returnRate}
                            subValue={latestRecord.qTotalEarnings}
                            subLabel={`${latestRecord.periodLabel} Gain:`}
                            footerNote={`Single-Qtr Return: ${latestRecord.qInvestmentReturnPct >= 0 ? '+' : ''}${latestRecord.qInvestmentReturnPct.toFixed(2)}%`}
                        />
                    </div>

                    {/* 4 Interactive Strategic Insight Strip Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(235px, 1fr))', gap: '1rem' }}>
                        <div
                            className="card"
                            style={{ padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.9rem', cursor: 'pointer' }}
                            onClick={() => onTabChange('simulator')}
                        >
                            <div style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '10px',
                                background: 'rgba(16, 185, 129, 0.12)',
                                color: '#10b981',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                                    Member Cash Multiplier
                                </div>
                                <div className="tabular-nums" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
                                    {latestRecord.wealthMultiplierOnMemberCash.toFixed(2)}x Wealth Ratio
                                </div>
                                <div style={{ fontSize: '0.73rem', color: 'var(--color-text-muted)' }}>
                                    +{latestRecord.profitToPrincipalPct.toFixed(2)}% net profit on total capital
                                </div>
                            </div>
                        </div>

                        {managerComp && (
                            <div
                                className="card"
                                style={{ padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.9rem', cursor: 'pointer' }}
                                onClick={() => onTabChange('policies')}
                            >
                                <div style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '10px',
                                    background: 'rgba(245, 158, 11, 0.12)',
                                    color: '#f59e0b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Award size={20} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                                        UOBAM vs TISCO Co-Manager Split
                                    </div>
                                    <div className="tabular-nums" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
                                        {managerComp.valueDifference >= 0 ? 'TISCO' : 'UOBAM'} +{formatTHB(Math.abs(managerComp.valueDifference))}
                                    </div>
                                    <div style={{ fontSize: '0.73rem', color: 'var(--color-text-muted)' }}>
                                        TISCO {managerComp.tiscoSharePct.toFixed(2)}% vs UOB {managerComp.uobSharePct.toFixed(2)}% →
                                    </div>
                                </div>
                            </div>
                        )}

                        <div
                            className="card"
                            style={{ padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.9rem', cursor: 'pointer' }}
                            onClick={() => onTabChange('policies')}
                        >
                            <div style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '10px',
                                background: 'rgba(139, 92, 246, 0.12)',
                                color: '#8b5cf6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <PieChartIcon size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                                    Actual vs Plan Asset Mix
                                </div>
                                <div className="tabular-nums" style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
                                    FI {latestRecord.fixedIncomeActualPct}% • Mix {latestRecord.mixedActualPct}% • Eq {latestRecord.foreignEquityActualPct}%
                                </div>
                                <div style={{ fontSize: '0.73rem', color: 'var(--color-text-muted)' }}>
                                    Target DIY: {latestRecord.fixedIncomePlanPct}% / {latestRecord.mixedPlanPct}% / {latestRecord.foreignEquityPlanPct}% (Inspect Drift →)
                                </div>
                            </div>
                        </div>

                        <div
                            className="card"
                            style={{ padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.9rem', cursor: 'pointer' }}
                            onClick={() => onTabChange('simulator')}
                        >
                            <div style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '10px',
                                background: 'rgba(59, 130, 246, 0.12)',
                                color: '#3b82f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Calculator size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                                    {latestRecord.year} YTD Tax-Deductible Savings
                                </div>
                                <div className="tabular-nums" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
                                    {formatTHB(latestRecord.ytd?.memberContribution || 0)}
                                </div>
                                <div style={{ fontSize: '0.73rem', color: 'var(--color-text-muted)' }}>
                                    Open Retirement & Tax Shield Simulator →
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CHART 1: Portfolio Growth & Principal vs Net Profit Trajectory */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div className="flex-between" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                                    Portfolio Wealth & Principal Trajectory (2020 – 2026)
                                </h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                    Grew from {formatTHB(enrichedData[0]?.totalBalance || 265425.77)} in {enrichedData[0]?.periodLabel || 'Q1/2020'} to {formatTHB(latestRecord.totalBalance)} in {latestRecord.periodLabel} (+{(((latestRecord.totalBalance - (enrichedData[0]?.totalBalance || 265425.77)) / (enrichedData[0]?.totalBalance || 265425.77)) * 100).toFixed(1)}% expansion)
                                </p>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <button onClick={() => setZoomLevel(prev => Math.max(28, prev - 10))} style={zoomBtnStyle} title="Zoom Out"><ZoomOut size={15} /></button>
                                    <button onClick={() => setZoomLevel(48)} style={zoomBtnStyle} title="Reset Zoom"><RotateCcw size={14} /></button>
                                    <button onClick={() => setZoomLevel(prev => Math.min(140, prev + 10))} style={zoomBtnStyle} title="Zoom In"><ZoomIn size={15} /></button>
                                </div>

                                <div className="segmented-control">
                                    <button
                                        className={`segmented-btn ${growthCompositionMode === 'TotalVsPrincipal' ? 'active' : ''}`}
                                        onClick={() => setGrowthCompositionMode('TotalVsPrincipal')}
                                    >
                                        Total vs Principal
                                    </button>
                                    <button
                                        className={`segmented-btn ${growthCompositionMode === 'StackedPortions' ? 'active' : ''}`}
                                        onClick={() => setGrowthCompositionMode('StackedPortions')}
                                    >
                                        Member / AEROTHAI / Profit
                                    </button>
                                </div>

                                <div className="segmented-control">
                                    <button
                                        className={`segmented-btn ${growthViewMode === 'Quarterly' ? 'active' : ''}`}
                                        onClick={() => setGrowthViewMode('Quarterly')}
                                    >
                                        Quarterly
                                    </button>
                                    <button
                                        className={`segmented-btn ${growthViewMode === 'Yearly' ? 'active' : ''}`}
                                        onClick={() => setGrowthViewMode('Yearly')}
                                    >
                                        Yearly
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                            <div style={{
                                height: '330px',
                                minWidth: '100%',
                                width: growthViewMode === 'Quarterly' ? `${Math.max(820, growthChartData.length * zoomLevel)}px` : '100%'
                            }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={growthChartData} margin={{ top: 10, right: 20, left: 5, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id="gradTotalBal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.32} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                                            </linearGradient>
                                            <linearGradient id="gradPrincipal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.22} />
                                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                        <XAxis
                                            dataKey="label"
                                            tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tickFormatter={(val) => `฿${(val / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })}k`}
                                            tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            formatter={(val: any, name: any) => [formatTHB(Number(val)), name]}
                                            labelFormatter={(_, payload) => payload?.[0]?.payload?.fullLabel || ''}
                                            contentStyle={{
                                                background: 'var(--color-surface)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: '10px'
                                            }}
                                        />
                                        <Legend />
                                        {growthCompositionMode === 'TotalVsPrincipal' ? (
                                            <>
                                                <Area
                                                    type="monotone"
                                                    dataKey="totalBalance"
                                                    name="Total Ending Balance"
                                                    stroke="#3b82f6"
                                                    strokeWidth={3}
                                                    fill="url(#gradTotalBal)"
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="totalPrincipal"
                                                    name="Cumulative Principal (Member + AEROTHAI)"
                                                    stroke="#06b6d4"
                                                    strokeWidth={2}
                                                    strokeDasharray="4 4"
                                                    fill="url(#gradPrincipal)"
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <Area
                                                    type="monotone"
                                                    stackId="1"
                                                    dataKey="memberPrincipal"
                                                    name="Member Principal"
                                                    stroke="#06b6d4"
                                                    fill="#06b6d4"
                                                    fillOpacity={0.65}
                                                />
                                                <Area
                                                    type="monotone"
                                                    stackId="1"
                                                    dataKey="employerPrincipal"
                                                    name="AEROTHAI Principal"
                                                    stroke="#3b82f6"
                                                    fill="#3b82f6"
                                                    fillOpacity={0.65}
                                                />
                                                <Area
                                                    type="monotone"
                                                    stackId="1"
                                                    dataKey="netProfit"
                                                    name="Cumulative Net Profit"
                                                    stroke="#10b981"
                                                    fill="#10b981"
                                                    fillOpacity={0.75}
                                                />
                                            </>
                                        )}
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* 2-Column Charts: Cashflow Decomposition & Return Analysis */}
                    <div className="charts-grid-2">
                        {/* CHART 2: Cashflow vs Investment Profit Decomposition */}
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <div className="flex-between" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.02rem', fontWeight: 800 }}>
                                        New Contributions vs Market Gain/Loss
                                    </h3>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                                        Isolating each period's cash inflow from pure investment P/L
                                    </p>
                                </div>
                                <div className="segmented-control">
                                    <button
                                        className={`segmented-btn ${cashflowViewMode === 'Quarterly' ? 'active' : ''}`}
                                        onClick={() => setCashflowViewMode('Quarterly')}
                                    >
                                        Quarterly
                                    </button>
                                    <button
                                        className={`segmented-btn ${cashflowViewMode === 'Yearly' ? 'active' : ''}`}
                                        onClick={() => setCashflowViewMode('Yearly')}
                                    >
                                        Yearly
                                    </button>
                                </div>
                            </div>

                            <div style={{ width: '100%', height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={cashflowChartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                        <XAxis
                                            dataKey="label"
                                            tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}k`}
                                            tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            formatter={(val: any, name: any) => [formatTHB(Number(val)), name]}
                                            labelFormatter={(_, payload) => payload?.[0]?.payload?.fullLabel || ''}
                                            contentStyle={{
                                                background: 'var(--color-surface)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: '10px'
                                            }}
                                        />
                                        <Legend />
                                        <ReferenceLine y={0} stroke="var(--color-border)" />
                                        <Bar
                                            dataKey="newContributions"
                                            name="New Contributions (Member+AEROTHAI)"
                                            fill="#3b82f6"
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <Bar
                                            dataKey="investmentGain"
                                            name="Investment Profit / Loss"
                                            fill="#10b981"
                                            radius={[4, 4, 0, 0]}
                                        >
                                            {cashflowChartData.map((entry, index) => (
                                                <Cell
                                                    key={`gain-${index}`}
                                                    fill={entry.investmentGain >= 0 ? '#10b981' : '#ef4444'}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* CHART 3: Return Analysis */}
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <div className="flex-between" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.02rem', fontWeight: 800 }}>
                                        Return & Growth Rate Analysis (%)
                                    </h3>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                                        Compare official YTD i-Return %, single-quarter return %, and YoY growth %
                                    </p>
                                </div>
                                <div className="segmented-control">
                                    <button
                                        className={`segmented-btn ${returnViewMode === 'YTD' ? 'active' : ''}`}
                                        onClick={() => setReturnViewMode('YTD')}
                                    >
                                        YTD i-Return
                                    </button>
                                    <button
                                        className={`segmented-btn ${returnViewMode === 'SingleQuarter' ? 'active' : ''}`}
                                        onClick={() => setReturnViewMode('SingleQuarter')}
                                    >
                                        Single Qtr %
                                    </button>
                                    <button
                                        className={`segmented-btn ${returnViewMode === 'YoY' ? 'active' : ''}`}
                                        onClick={() => setReturnViewMode('YoY')}
                                    >
                                        YoY Balance %
                                    </button>
                                </div>
                            </div>

                            <div style={{ width: '100%', height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={returnChartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                        <XAxis
                                            dataKey="label"
                                            tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tickFormatter={(v) => `${v}%`}
                                            tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            formatter={(val: any) => [`${Number(val) >= 0 ? '+' : ''}${Number(val).toFixed(2)}%`, returnViewMode]}
                                            labelFormatter={(_, payload) => payload?.[0]?.payload?.fullLabel || ''}
                                            contentStyle={{
                                                background: 'var(--color-surface)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: '10px'
                                            }}
                                        />
                                        <ReferenceLine y={0} stroke="var(--color-border)" />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {returnChartData.map((entry, index) => (
                                                <Cell
                                                    key={`ret-${index}`}
                                                    fill={entry.value >= 0 ? '#10b981' : '#ef4444'}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Compact Statement Ledger Preview on Overview */}
                    <HistoryList
                        data={enrichedData}
                        compact={true}
                        onInspectStatement={handleInspectStatement}
                        onUploadPdfTrigger={() => pdfInputRef.current?.click()}
                        onEdit={(rec) => {
                            setPdfImportState(null);
                            setEditingRecord(rec);
                            setShowModal(true);
                        }}
                        onAddRecord={() => {
                            setPdfImportState(null);
                            setEditingRecord(undefined);
                            setShowModal(true);
                        }}
                    />
                </>
            )}

            {/* TAB 2: SUB-FUND POLICIES & MANAGER ANALYTICS */}
            {activeTab === 'policies' && (
                <PolicyAnalyticsView records={enrichedData} />
            )}

            {/* TAB 3: OFFICIAL STATEMENT INSPECTOR */}
            {activeTab === 'statement' && (
                <StatementInspector
                    records={enrichedData}
                    selectedRecordId={selectedStatementId}
                    onSelectRecordId={setSelectedStatementId}
                    memberProfile={memberProfile}
                    onUploadPdfTrigger={() => pdfInputRef.current?.click()}
                    onEditRecord={(rec) => {
                        setPdfImportState(null);
                        setEditingRecord(rec);
                        setShowModal(true);
                    }}
                    onAddRecord={() => {
                        setPdfImportState(null);
                        setEditingRecord(undefined);
                        setShowModal(true);
                    }}
                />
            )}

            {/* TAB 4: RETIREMENT WEALTH & TAX SIMULATOR */}
            {activeTab === 'simulator' && (
                <WealthSimulator records={enrichedData} />
            )}

            {/* TAB 5: FULL LEDGER & DATA MANAGEMENT */}
            {activeTab === 'ledger' && (
                <HistoryList
                    data={enrichedData}
                    compact={false}
                    onInspectStatement={handleInspectStatement}
                    onUploadPdfTrigger={() => pdfInputRef.current?.click()}
                    onEdit={(rec) => {
                        setPdfImportState(null);
                        setEditingRecord(rec);
                        setShowModal(true);
                    }}
                    onAddRecord={() => {
                        setPdfImportState(null);
                        setEditingRecord(undefined);
                        setShowModal(true);
                    }}
                    onExportExcel={handleExportExcel}
                    onImportExcelTrigger={() => fileInputRef.current?.click()}
                    onResetToOfficial={handleResetToOfficial}
                />
            )}

            {/* ADD / EDIT STATEMENT MODAL */}
            {showModal && (
                <DataEntryForm
                    initialData={editingRecord}
                    templateRecord={latestRecord}
                    isPdfImport={pdfImportState?.isPdfImport}
                    pdfVerification={pdfImportState?.verification}
                    pdfPreviewUrl={pdfImportState?.previewDataUrl}
                    onClose={() => {
                        setShowModal(false);
                        setEditingRecord(undefined);
                        setPdfImportState(null);
                    }}
                    onSubmit={handleAddOrUpdateRecord}
                    onDelete={handleDeleteRecord}
                />
            )}
        </div>
    );
};

export default Dashboard;
