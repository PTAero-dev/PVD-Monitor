export type PolicyCategory = 'Fixed Income' | 'Mixed' | 'Foreign Equity';
export type FundManager = 'UOB' | 'TISCO';

export interface PVDPolicy {
    code: string; // e.g. 'AERO1-UOB', 'AERO2-UOB', 'AERO3-UOB', 'AERO1-TIS', 'AERO2-TIS', 'AERO3-TIS'
    nameTh: string; // 'ตราสารหนี้' | 'ผสม' | 'ตราสารทุนต่างประเทศ'
    manager: FundManager;
    category: PolicyCategory;
    nav: number; // Net Asset Value/Unit (Baht)
    units: number; // No. of Units
    planAllocation: number; // Investment Plan Allocation (%)
    actualPortion: number; // Investment Portion as of Statement Date (%)
    ytdReturn: number; // Year-to-date Return (%)
    accReturn5Y: number | null; // Accumulated Return 5 year (%)
}

export interface AccountMovementRow {
    memberContribution: number;
    memberEarnings: number;
    employerContribution: number;
    employerEarnings: number;
    total: number;
}

export interface PVDRecord {
    id: string;
    statementDate: string; // YYYY-MM-DD or DD/MM/YYYY
    statementDateDisplay?: string; // DD/MM/YYYY (AD)
    statementDateThai?: string; // DD/MM/YYYY (BE)
    quarter: number;
    year: number;
    thaiYear?: number;
    documentNo?: string;
    planCode?: string;
    planName?: string;
    planNameTh?: string;

    // Ending Balances (ยอดยกไป / Total balance as of this statement)
    memberContribution: number;
    memberEarnings: number;
    employerContribution: number;
    employerEarnings: number;

    // Totals
    totalBalance: number;
    totalMemberPortion: number;
    totalEmployerPortion: number;

    // Return
    returnRate?: number; // i-Return (%) YTD

    // Detailed statement movements
    prevYear?: AccountMovementRow; // ยอดยกมา / Balance from previous year
    ytd?: AccountMovementRow; // เงินกองทุนระหว่างปี / Year to date contribute / earnings

    // Sub-fund policy breakdown
    policies?: PVDPolicy[];

    // Optional metadata
    updatedAt?: string;
}

export interface MemberProfile {
    memberName: string;
    employeeCode: string;
    memberCode: string;
    referenceCode: string;
    departmentCode: string;
    employerName: string;
     employerNameTh: string;
    fundNameTh: string;
    fundNameEn: string;
    registrationNo: string;
}

export interface RetirementGoalConfig {
    currentAge: number;
    retirementAge: number;
    expectedAnnualReturn: number; // %
    annualContributionGrowth: number; // %
    targetAmount: number; // THB
}

export interface VerificationResult {
    isMathVerified: boolean;
    sourceMode: 'text-layer' | 'ocr-image';
    checks: {
        label: string;
        passed: boolean;
        detail: string;
    }[];
    warnings: string[];
}

export interface ParsedPDFStatementResult {
    record: PVDRecord;
    verification: VerificationResult;
    previewDataUrl?: string;
    rawRowsCount: number;
}

export type PVDHistory = PVDRecord[];
