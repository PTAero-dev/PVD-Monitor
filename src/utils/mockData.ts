import type { PVDRecord, MemberProfile } from '../types';

export const defaultMemberProfile: MemberProfile = {
    memberName: 'AEROTHAI PVD Member',
    employeeCode: '',
    memberCode: '',
    referenceCode: '',
    departmentCode: '',
    employerName: 'AEROTHAI (Aeronautical Radio of Thailand Ltd.)',
    employerNameTh: 'บริษัท วิทยุการบินแห่งประเทศไทย จำกัด',
    fundNameTh: 'กองทุนสำรองเลี้ยงชีพ พนักงานบริษัทวิทยุการบินแห่งประเทศไทย จำกัด ซึ่งจดทะเบียนแล้ว',
    fundNameEn: 'Provident Fund of Aeronautical Radio of Thailand Ltd. Employees (Registered)',
    registrationNo: '34/2535',
};

export const POLICY_METADATA: Record<string, {
    code: string;
    shortName: string;
    nameEn: string;
    nameTh: string;
    manager: 'UOB' | 'TISCO';
    category: 'Fixed Income' | 'Mixed' | 'Foreign Equity';
    color: string;
    riskLevel: string;
}> = {
    'AERO1-UOB': {
        code: 'AERO1-UOB',
        shortName: 'Fixed Income (UOB)',
        nameEn: 'Fixed Income Policy — UOBAM',
        nameTh: 'ตราสารหนี้ (AERO1-UOB)',
        manager: 'UOB',
        category: 'Fixed Income',
        color: '#0ea5e9',
        riskLevel: 'Low (Fixed Income)'
    },
    'AERO1-TIS': {
        code: 'AERO1-TIS',
        shortName: 'Fixed Income (TISCO)',
        nameEn: 'Fixed Income Policy — TISCO',
        nameTh: 'ตราสารหนี้ (AERO1-TIS)',
        manager: 'TISCO',
        category: 'Fixed Income',
        color: '#38bdf8',
        riskLevel: 'Low (Fixed Income)'
    },
    'AERO2-UOB': {
        code: 'AERO2-UOB',
        shortName: 'Mixed (UOB)',
        nameEn: 'Balanced / Mixed Policy — UOBAM',
        nameTh: 'ผสม (AERO2-UOB)',
        manager: 'UOB',
        category: 'Mixed',
        color: '#8b5cf6',
        riskLevel: 'Medium (Mixed Debt & Equity)'
    },
    'AERO2-TIS': {
        code: 'AERO2-TIS',
        shortName: 'Mixed (TISCO)',
        nameEn: 'Balanced / Mixed Policy — TISCO',
        nameTh: 'ผสม (AERO2-TIS)',
        manager: 'TISCO',
        category: 'Mixed',
        color: '#a78bfa',
        riskLevel: 'Medium (Mixed Debt & Equity)'
    },
    'AERO3-UOB': {
        code: 'AERO3-UOB',
        shortName: 'Foreign Equity (UOB)',
        nameEn: 'Foreign Equity Policy — UOBAM',
        nameTh: 'ตราสารทุนต่างประเทศ (AERO3-UOB)',
        manager: 'UOB',
        category: 'Foreign Equity',
        color: '#10b981',
        riskLevel: 'High (Global Equity)'
    },
    'AERO3-TIS': {
        code: 'AERO3-TIS',
        shortName: 'Foreign Equity (TISCO)',
        nameEn: 'Foreign Equity Policy — TISCO',
        nameTh: 'ตราสารทุนต่างประเทศ (AERO3-TIS)',
        manager: 'TISCO',
        category: 'Foreign Equity',
        color: '#34d399',
        riskLevel: 'High (Global Equity)'
    }
};

/**
 * Complete, visually verified dataset extracted from all 27 official PDF statements
 * in "Individual Statement of PVD" (PVD 2020 Q1.pdf through PVD 2026 Q3.pdf).
 */
export const mockPVDHistory: PVDRecord[] = [
    {
        id: '2020-Q1',
        year: 2020,
        thaiYear: 2563,
        quarter: 1,
        statementDate: '2020-03-31',
        statementDateDisplay: '31/03/2020',
        statementDateThai: '31/03/2563',
        documentNo: 'AERO/01052',
        planCode: 'Plan 7',
        planName: 'Plan 7 (Fixed Income 40%, Mixed 60%)',
        planNameTh: 'แผนที่ 7 นโยบายตราสารหนี้ 40% และนโยบายผสม 60%',
        returnRate: -13.88,
        prevYear: {
            memberContribution: 110871.45,
            memberEarnings: -1742.43,
            employerContribution: 110871.45,
            employerEarnings: -1784.23,
            total: 218216.24
        },
        ytd: {
            memberContribution: 45000.00,
            memberEarnings: -21381.10,
            employerContribution: 45000.00,
            employerEarnings: -21409.37,
            total: 47209.53
        },
        memberContribution: 155871.45,
        memberEarnings: -23123.53,
        employerContribution: 155871.45,
        employerEarnings: -23193.60,
        totalMemberPortion: 132747.92,
        totalEmployerPortion: 132677.85,
        totalBalance: 265425.77,
        policies: [
            { code: 'AERO1-UOB', nameTh: 'ตราสารหนี้', manager: 'UOB', category: 'Fixed Income', nav: 22.2216, units: 2786.2811, planAllocation: 20.00, actualPortion: 23.33, ytdReturn: 0.61, accReturn5Y: 0.61 },
            { code: 'AERO2-UOB', nameTh: 'ผสม', manager: 'UOB', category: 'Mixed', nav: 29.8788, units: 2383.0183, planAllocation: 30.00, actualPortion: 26.83, ytdReturn: -27.20, accReturn5Y: -27.20 },
            { code: 'AERO1-TIS', nameTh: 'ตราสารหนี้', manager: 'TISCO', category: 'Fixed Income', nav: 22.2088, units: 2787.2018, planAllocation: 20.00, actualPortion: 23.32, ytdReturn: 0.56, accReturn5Y: 0.56 },
            { code: 'AERO2-TIS', nameTh: 'ผสม', manager: 'TISCO', category: 'Mixed', nav: 29.6518, units: 2374.4942, planAllocation: 30.00, actualPortion: 26.52, ytdReturn: -27.75, accReturn5Y: -27.75 }
        ]
    },
    {
        id: '2020-Q2',
        year: 2020,
        thaiYear: 2563,
        quarter: 2,
        statementDate: '2020-06-30',
        statementDateDisplay: '30/06/2020',
        statementDateThai: '30/06/2563',
        documentNo: 'AERO/01046',
        planCode: 'Plan 7',
        planName: 'Plan 7 (Fixed Income 40%, Mixed 60%)',
        planNameTh: 'แผนที่ 7 นโยบายตราสารหนี้ 40% และนโยบายผสม 60%',
        returnRate: -2.83,
        prevYear: {
            memberContribution: 110871.45,
            memberEarnings: -1742.43,
            employerContribution: 110871.45,
            employerEarnings: -1784.23,
            total: 218216.24
        },
        ytd: {
            memberContribution: 91512.00,
            memberEarnings: -5609.64,
            employerContribution: 91512.00,
            employerEarnings: -5729.87,
            total: 171684.49
        },
        memberContribution: 202383.45,
        memberEarnings: -7352.07,
        employerContribution: 202383.45,
        employerEarnings: -7514.10,
        totalMemberPortion: 195031.38,
        totalEmployerPortion: 194869.35,
        totalBalance: 389900.73,
        policies: [
            { code: 'AERO1-UOB', nameTh: 'ตราสารหนี้', manager: 'UOB', category: 'Fixed Income', nav: 22.1845, units: 3626.3014, planAllocation: 20.00, actualPortion: 20.63, ytdReturn: 0.45, accReturn5Y: null },
            { code: 'AERO2-UOB', nameTh: 'ผสม', manager: 'UOB', category: 'Mixed', nav: 35.4969, units: 3184.8295, planAllocation: 30.00, actualPortion: 28.99, ytdReturn: -13.51, accReturn5Y: null },
            { code: 'AERO1-TIS', nameTh: 'ตราสารหนี้', manager: 'TISCO', category: 'Fixed Income', nav: 22.3107, units: 3623.4402, planAllocation: 20.00, actualPortion: 20.73, ytdReturn: 1.02, accReturn5Y: null },
            { code: 'AERO2-TIS', nameTh: 'ผสม', manager: 'TISCO', category: 'Mixed', nav: 36.6346, units: 3154.3946, planAllocation: 30.00, actualPortion: 29.65, ytdReturn: -10.74, accReturn5Y: null }
        ]
    },
    {
        id: '2020-Q3',
        year: 2020,
        thaiYear: 2563,
        quarter: 3,
        statementDate: '2020-09-30',
        statementDateDisplay: '30/09/2020',
        statementDateThai: '30/09/2563',
        documentNo: 'AERO/00150',
        planCode: 'Plan 7',
        planName: 'Plan 7 (Fixed Income 40%, Mixed 60%)',
        planNameTh: 'แผนที่ 7 นโยบายตราสารหนี้ 40% และนโยบายผสม 60%',
        returnRate: -6.49,
        prevYear: {
            memberContribution: 110871.45,
            memberEarnings: -1742.43,
            employerContribution: 110871.45,
            employerEarnings: -1784.23,
            total: 218216.24
        },
        ytd: {
            memberContribution: 138024.00,
            memberEarnings: -15970.63,
            employerContribution: 138024.00,
            employerEarnings: -16127.70,
            total: 243949.67
        },
        memberContribution: 248895.45,
        memberEarnings: -17713.06,
        employerContribution: 248895.45,
        employerEarnings: -17911.93,
        totalMemberPortion: 231182.39,
        totalEmployerPortion: 230983.52,
        totalBalance: 462165.91,
        policies: [
            { code: 'AERO1-UOB', nameTh: 'ตราสารหนี้', manager: 'UOB', category: 'Fixed Income', nav: 22.3871, units: 4323.1378, planAllocation: 20.00, actualPortion: 20.94, ytdReturn: 1.36, accReturn5Y: null },
            { code: 'AERO2-UOB', nameTh: 'ผสม', manager: 'UOB', category: 'Mixed', nav: 32.3149, units: 4090.8081, planAllocation: 30.00, actualPortion: 28.60, ytdReturn: -21.27, accReturn5Y: null },
            { code: 'AERO1-TIS', nameTh: 'ตราสารหนี้', manager: 'TISCO', category: 'Fixed Income', nav: 22.3657, units: 4354.7885, planAllocation: 20.00, actualPortion: 21.07, ytdReturn: 1.27, accReturn5Y: null },
            { code: 'AERO2-TIS', nameTh: 'ผสม', manager: 'TISCO', category: 'Mixed', nav: 33.9281, units: 4002.3297, planAllocation: 30.00, actualPortion: 29.39, ytdReturn: -17.33, accReturn5Y: null }
        ]
    },
    {
        id: '2020-Q4',
        year: 2020,
        thaiYear: 2563,
        quarter: 4,
        statementDate: '2020-12-31',
        statementDateDisplay: '31/12/2020',
        statementDateThai: '31/12/2563',
        documentNo: 'AERO/00144',
        planCode: 'Plan 7',
        planName: 'Plan 7 (Fixed Income 40%, Mixed 60%)',
        planNameTh: 'แผนที่ 7 นโยบายตราสารหนี้ 40% และนโยบายผสม 60%',
        returnRate: 3.04,
        prevYear: {
            memberContribution: 110871.45,
            memberEarnings: -1742.43,
            employerContribution: 110871.45,
            employerEarnings: -1784.23,
            total: 218216.24
        },
        ytd: {
            memberContribution: 185701.50,
            memberEarnings: 9244.06,
            employerContribution: 185701.50,
            employerEarnings: 8681.76,
            total: 389328.82
        },
        memberContribution: 296572.95,
        memberEarnings: 7501.63,
        employerContribution: 296572.95,
        employerEarnings: 6897.53,
        totalMemberPortion: 304074.58,
        totalEmployerPortion: 303470.48,
        totalBalance: 607545.06,
        policies: [
            { code: 'AERO1-UOB', nameTh: 'ตราสารหนี้', manager: 'UOB', category: 'Fixed Income', nav: 22.5980, units: 5173.7069, planAllocation: 20.00, actualPortion: 19.24, ytdReturn: 2.32, accReturn5Y: 2.32 },
            { code: 'AERO2-UOB', nameTh: 'ผสม', manager: 'UOB', category: 'Mixed', nav: 37.6440, units: 4898.4172, planAllocation: 30.00, actualPortion: 30.35, ytdReturn: -8.28, accReturn5Y: -8.28 },
            { code: 'AERO1-TIS', nameTh: 'ตราสารหนี้', manager: 'TISCO', category: 'Fixed Income', nav: 22.5255, units: 5207.5641, planAllocation: 20.00, actualPortion: 19.31, ytdReturn: 1.99, accReturn5Y: 1.99 },
            { code: 'AERO2-TIS', nameTh: 'ผสม', manager: 'TISCO', category: 'Mixed', nav: 39.6365, units: 4766.5818, planAllocation: 30.00, actualPortion: 31.10, ytdReturn: -3.43, accReturn5Y: -3.43 }
        ]
    },
    {
        id: '2021-Q1',
        year: 2021,
        thaiYear: 2564,
        quarter: 1,
        statementDate: '2021-03-31',
        statementDateDisplay: '31/03/2021',
        statementDateThai: '31/03/2564',
        documentNo: 'AERO/00143',
        planCode: 'Plan 7',
        planName: 'Plan 7 (Fixed Income 40%, Mixed 60%)',
        planNameTh: 'แผนที่ 7 นโยบายตราสารหนี้ 40% และนโยบายผสม 60%',
        returnRate: 8.38,
        prevYear: {
            memberContribution: 296572.95,
            memberEarnings: 7501.63,
            employerContribution: 296572.95,
            employerEarnings: 6897.53,
            total: 607545.06
        },
        ytd: {
            memberContribution: 47677.50,
            memberEarnings: 29098.23,
            employerContribution: 31785.00,
            employerEarnings: 28461.95,
            total: 137022.68
        },
        memberContribution: 344250.45,
        memberEarnings: 36599.86,
        employerContribution: 328357.95,
        employerEarnings: 35359.48,
        totalMemberPortion: 380850.31,
        totalEmployerPortion: 363717.43,
        totalBalance: 744567.74,
        policies: [
            { code: 'AERO1-UOB', nameTh: 'ตราสารหนี้', manager: 'UOB', category: 'Fixed Income', nav: 22.6064, units: 6041.0575, planAllocation: 20.00, actualPortion: 18.34, ytdReturn: 0.04, accReturn5Y: 2.36 },
            { code: 'AERO2-UOB', nameTh: 'ผสม', manager: 'UOB', category: 'Mixed', nav: 42.9930, units: 5403.8122, planAllocation: 30.00, actualPortion: 31.20, ytdReturn: 14.21, accReturn5Y: 4.75 },
            { code: 'AERO1-TIS', nameTh: 'ตราสารหนี้', manager: 'TISCO', category: 'Fixed Income', nav: 22.4507, units: 6149.8362, planAllocation: 20.00, actualPortion: 18.54, ytdReturn: -0.33, accReturn5Y: 1.65 },
            { code: 'AERO2-TIS', nameTh: 'ผสม', manager: 'TISCO', category: 'Mixed', nav: 45.6847, units: 5201.0182, planAllocation: 30.00, actualPortion: 31.92, ytdReturn: 15.26, accReturn5Y: 11.31 }
        ]
    },
    {
        id: '2021-Q2',
        year: 2021,
        thaiYear: 2564,
        quarter: 2,
        statementDate: '2021-06-30',
        statementDateDisplay: '30/06/2021',
        statementDateThai: '30/06/2564',
        documentNo: 'AERO/00143',
        planCode: 'Plan 7',
        planName: 'Plan 7 (Fixed Income 40%, Mixed 60%)',
        planNameTh: 'แผนที่ 7 นโยบายตราสารหนี้ 40% และนโยบายผสม 60%',
        returnRate: 6.77,
        prevYear: {
            memberContribution: 296572.95,
            memberEarnings: 7501.63,
            employerContribution: 296572.95,
            employerEarnings: 6897.53,
            total: 607545.06
        },
        ytd: {
            memberContribution: 95355.00,
            memberEarnings: 25265.51,
            employerContribution: 31785.00,
            employerEarnings: 24509.18,
            total: 176914.69
        },
        memberContribution: 391927.95,
        memberEarnings: 32767.14,
        employerContribution: 328357.95,
        employerEarnings: 31406.71,
        totalMemberPortion: 424695.09,
        totalEmployerPortion: 359764.66,
        totalBalance: 784459.75,
        policies: [
            { code: 'AERO1-UOB', nameTh: 'ตราสารหนี้', manager: 'UOB', category: 'Fixed Income', nav: 22.7222, units: 6465.6008, planAllocation: 20.00, actualPortion: 18.73, ytdReturn: 0.55, accReturn5Y: 2.88 },
            { code: 'AERO2-UOB', nameTh: 'ผสม', manager: 'UOB', category: 'Mixed', nav: 41.7734, units: 5746.5360, planAllocation: 30.00, actualPortion: 30.60, ytdReturn: 10.97, accReturn5Y: 1.78 },
            { code: 'AERO1-TIS', nameTh: 'ตราสารหนี้', manager: 'TISCO', category: 'Fixed Income', nav: 22.5203, units: 6577.7730, planAllocation: 20.00, actualPortion: 18.88, ytdReturn: -0.02, accReturn5Y: 1.97 },
            { code: 'AERO2-TIS', nameTh: 'ผสม', manager: 'TISCO', category: 'Mixed', nav: 45.1814, units: 5519.1141, planAllocation: 30.00, actualPortion: 31.79, ytdReturn: 13.99, accReturn5Y: 10.08 }
        ]
    },
    {
        id: '2021-Q3',
        year: 2021,
        thaiYear: 2564,
        quarter: 3,
        statementDate: '2021-09-30',
        statementDateDisplay: '30/09/2021',
        statementDateThai: '30/09/2564',
        documentNo: 'AERO/00143',
        planCode: 'DIY',
        planName: 'DIY (Fixed Income 50%, Mixed 40%, Foreign Equity 10%)',
        planNameTh: 'DIY สมาชิกเลือกสัดส่วนการลงทุนด้วยตนเอง (DIY)',
        returnRate: 7.34,
        prevYear: {
            memberContribution: 296572.95,
            memberEarnings: 7501.63,
            employerContribution: 296572.95,
            employerEarnings: 6897.53,
            total: 607545.06
        },
        ytd: {
            memberContribution: 143032.50,
            memberEarnings: 31379.74,
            employerContribution: 79462.50,
            employerEarnings: 29562.48,
            total: 283437.22
        },
        memberContribution: 439605.45,
        memberEarnings: 38881.37,
        employerContribution: 376035.45,
        employerEarnings: 36460.01,
        totalMemberPortion: 478486.82,
        totalEmployerPortion: 412495.46,
        totalBalance: 890982.28,
        policies: [
            { code: 'AERO1-UOB', nameTh: 'ตราสารหนี้', manager: 'UOB', category: 'Fixed Income', nav: 22.7680, units: 9444.3224, planAllocation: 25.00, actualPortion: 24.13, ytdReturn: 0.75, accReturn5Y: 3.09 },
            { code: 'AERO2-UOB', nameTh: 'ผสม', manager: 'UOB', category: 'Mixed', nav: 42.5804, units: 4197.3617, planAllocation: 20.00, actualPortion: 20.06, ytdReturn: 13.11, accReturn5Y: 3.75 },
            { code: 'AERO3-UOB', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'UOB', category: 'Foreign Equity', nav: 10.3354, units: 4121.9445, planAllocation: 5.00, actualPortion: 4.78, ytdReturn: 3.35, accReturn5Y: 3.35 },
            { code: 'AERO1-TIS', nameTh: 'ตราสารหนี้', manager: 'TISCO', category: 'Fixed Income', nav: 22.5192, units: 9919.5496, planAllocation: 25.00, actualPortion: 25.07, ytdReturn: -0.03, accReturn5Y: 1.96 },
            { code: 'AERO2-TIS', nameTh: 'ผสม', manager: 'TISCO', category: 'Mixed', nav: 47.5180, units: 3921.4075, planAllocation: 20.00, actualPortion: 20.91, ytdReturn: 19.88, accReturn5Y: 15.78 },
            { code: 'AERO3-TIS', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'TISCO', category: 'Foreign Equity', nav: 10.3498, units: 4339.1072, planAllocation: 5.00, actualPortion: 5.05, ytdReturn: 3.50, accReturn5Y: 3.50 }
        ]
    },
    {
        id: '2021-Q4',
        year: 2021,
        thaiYear: 2564,
        quarter: 4,
        statementDate: '2021-12-31',
        statementDateDisplay: '31/12/2021',
        statementDateThai: '31/12/2564',
        documentNo: 'AERO/00142',
        planCode: 'DIY',
        planName: 'DIY (Fixed Income 50%, Mixed 40%, Foreign Equity 10%)',
        planNameTh: 'DIY สมาชิกเลือกสัดส่วนการลงทุนด้วยตนเอง (DIY)',
        returnRate: 9.18,
        prevYear: {
            memberContribution: 296572.95,
            memberEarnings: 7501.63,
            employerContribution: 296572.95,
            employerEarnings: 6897.53,
            total: 607545.06
        },
        ytd: {
            memberContribution: 190710.00,
            memberEarnings: 42569.95,
            employerContribution: 85819.50,
            employerEarnings: 38576.21,
            total: 357675.66
        },
        memberContribution: 487282.95,
        memberEarnings: 50071.58,
        employerContribution: 382392.45,
        employerEarnings: 45473.74,
        totalMemberPortion: 537354.53,
        totalEmployerPortion: 427866.19,
        totalBalance: 965220.72,
        policies: [
            { code: 'AERO1-UOB', nameTh: 'ตราสารหนี้', manager: 'UOB', category: 'Fixed Income', nav: 22.8591, units: 10039.3388, planAllocation: 25.00, actualPortion: 23.78, ytdReturn: 1.16, accReturn5Y: 3.50 },
            { code: 'AERO2-UOB', nameTh: 'ผสม', manager: 'UOB', category: 'Mixed', nav: 44.8679, units: 4446.4958, planAllocation: 20.00, actualPortion: 20.67, ytdReturn: 19.19, accReturn5Y: 9.32 },
            { code: 'AERO3-UOB', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'UOB', category: 'Foreign Equity', nav: 10.8596, units: 4373.6931, planAllocation: 5.00, actualPortion: 4.92, ytdReturn: 8.60, accReturn5Y: 8.60 },
            { code: 'AERO1-TIS', nameTh: 'ตราสารหนี้', manager: 'TISCO', category: 'Fixed Income', nav: 22.5522, units: 10522.2482, planAllocation: 25.00, actualPortion: 24.59, ytdReturn: 0.12, accReturn5Y: 2.11 },
            { code: 'AERO2-TIS', nameTh: 'ผสม', manager: 'TISCO', category: 'Mixed', nav: 49.2189, units: 4147.4578, planAllocation: 20.00, actualPortion: 21.15, ytdReturn: 24.18, accReturn5Y: 19.92 },
            { code: 'AERO3-TIS', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'TISCO', category: 'Foreign Equity', nav: 10.2822, units: 4599.7780, planAllocation: 5.00, actualPortion: 4.89, ytdReturn: 2.82, accReturn5Y: 2.82 }
        ]
    },
    {
        id: '2022-Q1',
        year: 2022,
        thaiYear: 2565,
        quarter: 1,
        statementDate: '2022-03-31',
        statementDateDisplay: '31/03/2022',
        statementDateThai: '31/03/2565',
        documentNo: 'AERO/00143',
        planCode: 'DIY',
        planName: 'DIY (Fixed Income 40%, Mixed 50%, Foreign Equity 10%)',
        planNameTh: 'DIY สมาชิกเลือกสัดส่วนการลงทุนด้วยตนเอง (DIY)',
        returnRate: 0.51,
        prevYear: {
            memberContribution: 487282.95,
            memberEarnings: 50071.58,
            employerContribution: 382392.45,
            employerEarnings: 45473.74,
            total: 965220.72
        },
        ytd: {
            memberContribution: 47677.50,
            memberEarnings: 3159.26,
            employerContribution: 6357.00,
            employerEarnings: 2046.58,
            total: 59240.34
        },
        memberContribution: 534960.45,
        memberEarnings: 53230.84,
        employerContribution: 388749.45,
        employerEarnings: 47520.32,
        totalMemberPortion: 588191.29,
        totalEmployerPortion: 436269.77,
        totalBalance: 1024461.06,
        policies: [
            { code: 'AERO1-UOB', nameTh: 'ตราสารหนี้', manager: 'UOB', category: 'Fixed Income', nav: 22.9371, units: 8768.7775, planAllocation: 20.00, actualPortion: 19.63, ytdReturn: 0.34, accReturn5Y: 3.85 },
            { code: 'AERO2-UOB', nameTh: 'ผสม', manager: 'UOB', category: 'Mixed', nav: 45.9700, units: 5594.5702, planAllocation: 25.00, actualPortion: 25.10, ytdReturn: 2.46, accReturn5Y: 12.01 },
            { code: 'AERO3-UOB', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'UOB', category: 'Foreign Equity', nav: 10.3144, units: 4827.1806, planAllocation: 5.00, actualPortion: 4.86, ytdReturn: -5.02, accReturn5Y: 3.14 },
            { code: 'AERO1-TIS', nameTh: 'ตราสารหนี้', manager: 'TISCO', category: 'Fixed Income', nav: 22.5328, units: 9073.5771, planAllocation: 20.00, actualPortion: 19.96, ytdReturn: -0.09, accReturn5Y: 2.02 },
            { code: 'AERO2-TIS', nameTh: 'ผสม', manager: 'TISCO', category: 'Mixed', nav: 50.1074, units: 5240.4947, planAllocation: 25.00, actualPortion: 25.63, ytdReturn: 1.81, accReturn5Y: 22.09 },
            { code: 'AERO3-TIS', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'TISCO', category: 'Foreign Equity', nav: 9.3774, units: 5259.2610, planAllocation: 5.00, actualPortion: 4.82, ytdReturn: -8.80, accReturn5Y: -6.23 }
        ]
    },
    {
        id: '2022-Q2',
        year: 2022,
        thaiYear: 2565,
        quarter: 2,
        statementDate: '2022-06-30',
        statementDateDisplay: '30/06/2022',
        statementDateThai: '30/06/2565',
        documentNo: 'AERO/00139',
        planCode: 'DIY',
        planName: 'DIY (Fixed Income 40%, Mixed 50%, Foreign Equity 10%)',
        planNameTh: 'DIY สมาชิกเลือกสัดส่วนการลงทุนด้วยตนเอง (DIY)',
        returnRate: -3.68,
        prevYear: {
            memberContribution: 487282.95,
            memberEarnings: 50071.58,
            employerContribution: 382392.45,
            employerEarnings: 45473.74,
            total: 965220.72
        },
        ytd: {
            memberContribution: 95355.00,
            memberEarnings: -23073.34,
            employerContribution: 54034.50,
            employerEarnings: -17977.79,
            total: 108338.37
        },
        memberContribution: 582637.95,
        memberEarnings: 26998.24,
        employerContribution: 436426.95,
        employerEarnings: 27495.95,
        totalMemberPortion: 609636.19,
        totalEmployerPortion: 463922.90,
        totalBalance: 1073559.09,
        policies: [
            { code: 'AERO1-UOB', nameTh: 'ตราสารหนี้', manager: 'UOB', category: 'Fixed Income', nav: 22.8751, units: 9606.2038, planAllocation: 20.00, actualPortion: 20.47, ytdReturn: 0.07, accReturn5Y: 3.57 },
            { code: 'AERO2-UOB', nameTh: 'ผสม', manager: 'UOB', category: 'Mixed', nav: 43.9699, units: 6125.6388, planAllocation: 25.00, actualPortion: 25.09, ytdReturn: -2.00, accReturn5Y: 7.13 },
            { code: 'AERO3-UOB', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'UOB', category: 'Foreign Equity', nav: 8.8459, units: 5346.4443, planAllocation: 5.00, actualPortion: 4.41, ytdReturn: -18.54, accReturn5Y: -11.54 },
            { code: 'AERO1-TIS', nameTh: 'ตราสารหนี้', manager: 'TISCO', category: 'Fixed Income', nav: 22.3654, units: 9929.4260, planAllocation: 20.00, actualPortion: 20.69, ytdReturn: -0.83, accReturn5Y: 1.27 },
            { code: 'AERO2-TIS', nameTh: 'ผสม', manager: 'TISCO', category: 'Mixed', nav: 46.5902, units: 5735.0312, planAllocation: 25.00, actualPortion: 24.89, ytdReturn: -5.34, accReturn5Y: 13.52 },
            { code: 'AERO3-TIS', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'TISCO', category: 'Foreign Equity', nav: 8.2160, units: 5830.8834, planAllocation: 5.00, actualPortion: 4.45, ytdReturn: -20.09, accReturn5Y: -17.84 }
        ]
    },
    {
        id: '2022-Q3',
        year: 2022,
        thaiYear: 2565,
        quarter: 3,
        statementDate: '2022-09-30',
        statementDateDisplay: '30/09/2022',
        statementDateThai: '30/09/2565',
        documentNo: 'AERO/00139',
        planCode: 'DIY',
        planName: 'DIY (Fixed Income 40%, Mixed 50%, Foreign Equity 10%)',
        planNameTh: 'DIY สมาชิกเลือกสัดส่วนการลงทุนด้วยตนเอง (DIY)',
        returnRate: -3.15,
        prevYear: {
            memberContribution: 487282.95,
            memberEarnings: 50071.58,
            employerContribution: 382392.45,
            employerEarnings: 45473.74,
            total: 965220.72
        },
        ytd: {
            memberContribution: 143032.50,
            memberEarnings: -21070.49,
            employerContribution: 101712.00,
            employerEarnings: -16996.79,
            total: 206677.22
        },
        memberContribution: 630315.45,
        memberEarnings: 29001.09,
        employerContribution: 484104.45,
        employerEarnings: 28476.95,
        totalMemberPortion: 659316.54,
        totalEmployerPortion: 512581.40,
        totalBalance: 1171897.94,
        policies: [
            { code: 'AERO1-UOB', nameTh: 'ตราสารหนี้', manager: 'UOB', category: 'Fixed Income', nav: 22.8985, units: 10215.7054, planAllocation: 20.00, actualPortion: 19.96, ytdReturn: 0.17, accReturn5Y: 3.68 },
            { code: 'AERO2-UOB', nameTh: 'ผสม', manager: 'UOB', category: 'Mixed', nav: 45.3206, units: 6631.5459, planAllocation: 25.00, actualPortion: 25.65, ytdReturn: 1.01, accReturn5Y: 10.42 },
            { code: 'AERO3-UOB', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'UOB', category: 'Foreign Equity', nav: 8.4662, units: 6609.8223, planAllocation: 5.00, actualPortion: 4.78, ytdReturn: -22.04, accReturn5Y: -15.34 },
            { code: 'AERO1-TIS', nameTh: 'ตราสารหนี้', manager: 'TISCO', category: 'Fixed Income', nav: 22.4050, units: 10462.1511, planAllocation: 20.00, actualPortion: 20.00, ytdReturn: -0.65, accReturn5Y: 1.45 },
            { code: 'AERO2-TIS', nameTh: 'ผสม', manager: 'TISCO', category: 'Mixed', nav: 46.7166, units: 6270.6991, planAllocation: 25.00, actualPortion: 25.00, ytdReturn: -5.08, accReturn5Y: 13.82 },
            { code: 'AERO3-TIS', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'TISCO', category: 'Foreign Equity', nav: 7.5860, units: 7133.8868, planAllocation: 5.00, actualPortion: 4.61, ytdReturn: -26.22, accReturn5Y: -24.14 }
        ]
    },
    {
        id: '2022-Q4',
        year: 2022,
        thaiYear: 2565,
        quarter: 4,
        statementDate: '2022-12-31',
        statementDateDisplay: '31/12/2022',
        statementDateThai: '31/12/2565',
        documentNo: 'AERO/00133',
        planCode: 'DIY',
        planName: 'DIY (Fixed Income 40%, Mixed 50%, Foreign Equity 10%)',
        planNameTh: 'DIY สมาชิกเลือกสัดส่วนการลงทุนด้วยตนเอง (DIY)',
        returnRate: 0.28,
        prevYear: {
            memberContribution: 487282.95,
            memberEarnings: 50071.58,
            employerContribution: 382392.45,
            employerEarnings: 45473.74,
            total: 965220.72
        },
        ytd: {
            memberContribution: 191987.55,
            memberEarnings: 2737.51,
            employerContribution: 150667.05,
            employerEarnings: 925.03,
            total: 346317.14
        },
        memberContribution: 679270.50,
        memberEarnings: 52809.09,
        employerContribution: 533059.50,
        employerEarnings: 46398.77,
        totalMemberPortion: 732079.59,
        totalEmployerPortion: 579458.27,
        totalBalance: 1311537.86,
        policies: [
            { code: 'AERO1-UOB', nameTh: 'ตราสารหนี้', manager: 'UOB', category: 'Fixed Income', nav: 23.1299, units: 11073.8409, planAllocation: 20.00, actualPortion: 19.53, ytdReturn: 1.18, accReturn5Y: 4.73 },
            { code: 'AERO2-UOB', nameTh: 'ผสม', manager: 'UOB', category: 'Mixed', nav: 47.7418, units: 7160.3737, planAllocation: 25.00, actualPortion: 26.06, ytdReturn: 6.41, accReturn5Y: 16.32 },
            { code: 'AERO3-UOB', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'UOB', category: 'Foreign Equity', nav: 8.6206, units: 7172.2490, planAllocation: 5.00, actualPortion: 4.71, ytdReturn: -20.62, accReturn5Y: -13.79 },
            { code: 'AERO1-TIS', nameTh: 'ตราสารหนี้', manager: 'TISCO', category: 'Fixed Income', nav: 22.7005, units: 11337.4523, planAllocation: 20.00, actualPortion: 19.62, ytdReturn: 0.66, accReturn5Y: 2.78 },
            { code: 'AERO2-TIS', nameTh: 'ผสม', manager: 'TISCO', category: 'Mixed', nav: 49.2422, units: 6783.1837, planAllocation: 25.00, actualPortion: 25.47, ytdReturn: 0.05, accReturn5Y: 19.98 },
            { code: 'AERO3-TIS', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'TISCO', category: 'Foreign Equity', nav: 7.7727, units: 7762.8211, planAllocation: 5.00, actualPortion: 4.61, ytdReturn: -24.41, accReturn5Y: -22.27 }
        ]
    },
    {
        id: '2023-Q1',
        year: 2023,
        thaiYear: 2566,
        quarter: 1,
        statementDate: '2023-03-31',
        statementDateDisplay: '31/03/2023',
        statementDateThai: '31/03/2566',
        documentNo: 'AERO/00126',
        planCode: 'DIY',
        planName: 'DIY (Fixed Income 40%, Mixed 50%, Foreign Equity 10%)',
        planNameTh: 'DIY สมาชิกเลือกสัดส่วนการลงทุนด้วยตนเอง (DIY)',
        returnRate: -1.98,
        prevYear: {
            memberContribution: 679270.50,
            memberEarnings: 52809.09,
            employerContribution: 533059.50,
            employerEarnings: 46398.77,
            total: 1311537.86
        },
        ytd: {
            memberContribution: 48955.05,
            memberEarnings: -15401.32,
            employerContribution: 48955.05,
            employerEarnings: -12491.33,
            total: 70017.45
        },
        memberContribution: 728225.55,
        memberEarnings: 37407.77,
        employerContribution: 582014.55,
        employerEarnings: 33907.44,
        totalMemberPortion: 765633.32,
        totalEmployerPortion: 615921.99,
        totalBalance: 1381555.31,
        policies: [
            { code: 'AERO1-UOB', nameTh: 'ตราสารหนี้', manager: 'UOB', category: 'Fixed Income', nav: 23.2239, units: 12257.4139, planAllocation: 20.00, actualPortion: 20.60, ytdReturn: 0.41, accReturn5Y: 5.15 },
            { code: 'AERO2-UOB', nameTh: 'ผสม', manager: 'UOB', category: 'Mixed', nav: 46.0398, units: 7433.5877, planAllocation: 25.00, actualPortion: 24.77, ytdReturn: -3.57, accReturn5Y: 12.18 },
            { code: 'AERO3-UOB', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'UOB', category: 'Foreign Equity', nav: 8.7239, units: 8209.7870, planAllocation: 5.00, actualPortion: 5.18, ytdReturn: 1.20, accReturn5Y: -12.76 },
            { code: 'AERO1-TIS', nameTh: 'ตราสารหนี้', manager: 'TISCO', category: 'Fixed Income', nav: 22.7739, units: 12347.4980, planAllocation: 20.00, actualPortion: 20.35, ytdReturn: 0.32, accReturn5Y: 3.12 },
            { code: 'AERO2-TIS', nameTh: 'ผสม', manager: 'TISCO', category: 'Mixed', nav: 46.2874, units: 7133.9075, planAllocation: 25.00, actualPortion: 23.90, ytdReturn: -6.00, accReturn5Y: 12.78 },
            { code: 'AERO3-TIS', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'TISCO', category: 'Foreign Equity', nav: 7.9625, units: 8994.3336, planAllocation: 5.00, actualPortion: 5.20, ytdReturn: 2.44, accReturn5Y: -20.38 }
        ]
    },
    {
        id: '2023-Q2',
        year: 2023,
        thaiYear: 2566,
        quarter: 2,
        statementDate: '2023-06-30',
        statementDateDisplay: '30/06/2023',
        statementDateThai: '30/06/2566',
        documentNo: 'AERO/00132',
        planCode: 'DIY',
        planName: 'DIY (Fixed Income 40%, Mixed 50%, Foreign Equity 10%)',
        planNameTh: 'DIY สมาชิกเลือกสัดส่วนการลงทุนด้วยตนเอง (DIY)',
        returnRate: -3.20,
        prevYear: {
            memberContribution: 679270.50,
            memberEarnings: 52809.09,
            employerContribution: 533059.50,
            employerEarnings: 46398.77,
            total: 1311537.86
        },
        ytd: {
            memberContribution: 99280.80,
            memberEarnings: -26320.20,
            employerContribution: 99280.80,
            employerEarnings: -22064.68,
            total: 150176.72
        },
        memberContribution: 778551.30,
        memberEarnings: 26488.89,
        employerContribution: 632340.30,
        employerEarnings: 24334.09,
        totalMemberPortion: 805040.19,
        totalEmployerPortion: 656674.39,
        totalBalance: 1461714.58,
        policies: [
            { code: 'AERO1-UOB', nameTh: 'ตราสารหนี้', manager: 'UOB', category: 'Fixed Income', nav: 23.2607, units: 13132.2169, planAllocation: 20.00, actualPortion: 20.90, ytdReturn: 0.57, accReturn5Y: 5.32 },
            { code: 'AERO2-UOB', nameTh: 'ผสม', manager: 'UOB', category: 'Mixed', nav: 43.6914, units: 8007.8913, planAllocation: 25.00, actualPortion: 23.94, ytdReturn: -8.48, accReturn5Y: 6.45 },
            { code: 'AERO3-UOB', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'UOB', category: 'Foreign Equity', nav: 9.0637, units: 8780.5097, planAllocation: 5.00, actualPortion: 5.44, ytdReturn: 5.14, accReturn5Y: -9.36 },
            { code: 'AERO1-TIS', nameTh: 'ตราสารหนี้', manager: 'TISCO', category: 'Fixed Income', nav: 22.8040, units: 13239.6291, planAllocation: 20.00, actualPortion: 20.65, ytdReturn: 0.46, accReturn5Y: 3.25 },
            { code: 'AERO2-TIS', nameTh: 'ผสม', manager: 'TISCO', category: 'Mixed', nav: 44.7592, units: 7699.6072, planAllocation: 25.00, actualPortion: 23.58, ytdReturn: -9.10, accReturn5Y: 9.06 },
            { code: 'AERO3-TIS', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'TISCO', category: 'Foreign Equity', nav: 8.3456, units: 9615.2905, planAllocation: 5.00, actualPortion: 5.49, ytdReturn: 7.37, accReturn5Y: -16.54 }
        ]
    },
    {
        id: '2023-Q3',
        year: 2023,
        thaiYear: 2566,
        quarter: 3,
        statementDate: '2023-09-30',
        statementDateDisplay: '30/09/2023',
        statementDateThai: '30/09/2566',
        documentNo: 'AERO/00133',
        planCode: 'DIY',
        planName: 'DIY (Fixed Income 40%, Mixed 50%, Foreign Equity 10%)',
        planNameTh: 'DIY สมาชิกเลือกสัดส่วนการลงทุนด้วยตนเอง (DIY)',
        returnRate: -3.08,
        prevYear: {
            memberContribution: 679270.50,
            memberEarnings: 52809.09,
            employerContribution: 533059.50,
            employerEarnings: 46398.77,
            total: 1311537.86
        },
        ytd: {
            memberContribution: 149606.55,
            memberEarnings: -26488.52,
            employerContribution: 149606.55,
            employerEarnings: -23139.30,
            total: 249585.28
        },
        memberContribution: 828877.05,
        memberEarnings: 26320.57,
        employerContribution: 682666.05,
        employerEarnings: 23259.47,
        totalMemberPortion: 855197.62,
        totalEmployerPortion: 705925.52,
        totalBalance: 1561123.14,
        policies: [
            { code: 'AERO1-UOB', nameTh: 'ตราสารหนี้', manager: 'UOB', category: 'Fixed Income', nav: 23.2829, units: 13511.0675, planAllocation: 20.00, actualPortion: 20.15, ytdReturn: 0.66, accReturn5Y: 5.42 },
            { code: 'AERO2-UOB', nameTh: 'ผสม', manager: 'UOB', category: 'Mixed', nav: 43.8147, units: 8979.5479, planAllocation: 25.00, actualPortion: 25.20, ytdReturn: -8.23, accReturn5Y: 6.75 },
            { code: 'AERO3-UOB', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'UOB', category: 'Foreign Equity', nav: 8.6879, units: 8674.0748, planAllocation: 5.00, actualPortion: 4.83, ytdReturn: 0.78, accReturn5Y: -13.12 },
            { code: 'AERO1-TIS', nameTh: 'ตราสารหนี้', manager: 'TISCO', category: 'Fixed Income', nav: 22.8345, units: 13638.7157, planAllocation: 20.00, actualPortion: 19.95, ytdReturn: 0.59, accReturn5Y: 3.39 },
            { code: 'AERO2-TIS', nameTh: 'ผสม', manager: 'TISCO', category: 'Mixed', nav: 45.1076, units: 8674.7824, planAllocation: 25.00, actualPortion: 25.07, ytdReturn: -8.40, accReturn5Y: 9.90 },
            { code: 'AERO3-TIS', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'TISCO', category: 'Foreign Equity', nav: 8.0463, units: 9323.3868, planAllocation: 5.00, actualPortion: 4.80, ytdReturn: 3.52, accReturn5Y: -19.54 }
        ]
    },
    {
        id: '2023-Q4',
        year: 2023,
        thaiYear: 2566,
        quarter: 4,
        statementDate: '2023-12-31',
        statementDateDisplay: '31/12/2023',
        statementDateThai: '31/12/2566',
        documentNo: 'AERO/00136',
        planCode: 'DIY',
        planName: 'DIY (Fixed Income 40%, Mixed 50%, Foreign Equity 10%)',
        planNameTh: 'DIY สมาชิกเลือกสัดส่วนการลงทุนด้วยตนเอง (DIY)',
        returnRate: -3.57,
        prevYear: {
            memberContribution: 679270.50,
            memberEarnings: 52809.09,
            employerContribution: 533059.50,
            employerEarnings: 46398.77,
            total: 1311537.86
        },
        ytd: {
            memberContribution: 201303.00,
            memberEarnings: -32678.42,
            employerContribution: 201303.00,
            employerEarnings: -28591.95,
            total: 341335.63
        },
        memberContribution: 880573.50,
        memberEarnings: 20130.67,
        employerContribution: 734362.50,
        employerEarnings: 17806.82,
        totalMemberPortion: 900704.17,
        totalEmployerPortion: 752169.32,
        totalBalance: 1652873.49,
        policies: [
            { code: 'AERO1-UOB', nameTh: 'ตราสารหนี้', manager: 'UOB', category: 'Fixed Income', nav: 23.5442, units: 14398.4636, planAllocation: 20.00, actualPortion: 20.51, ytdReturn: 1.79, accReturn5Y: 6.60 },
            { code: 'AERO2-UOB', nameTh: 'ผสม', manager: 'UOB', category: 'Mixed', nav: 42.3446, units: 9603.0728, planAllocation: 25.00, actualPortion: 24.60, ytdReturn: -11.30, accReturn5Y: 3.17 },
            { code: 'AERO3-UOB', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'UOB', category: 'Foreign Equity', nav: 9.4608, units: 9256.8964, planAllocation: 5.00, actualPortion: 5.30, ytdReturn: 9.75, accReturn5Y: -5.39 },
            { code: 'AERO1-TIS', nameTh: 'ตราสารหนี้', manager: 'TISCO', category: 'Fixed Income', nav: 23.0852, units: 14543.1738, planAllocation: 20.00, actualPortion: 20.31, ytdReturn: 1.69, accReturn5Y: 4.53 },
            { code: 'AERO2-TIS', nameTh: 'ผสม', manager: 'TISCO', category: 'Mixed', nav: 42.8952, units: 9287.7336, planAllocation: 25.00, actualPortion: 24.10, ytdReturn: -12.89, accReturn5Y: 4.51 },
            { code: 'AERO3-TIS', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'TISCO', category: 'Foreign Equity', nav: 8.5917, units: 9954.4903, planAllocation: 5.00, actualPortion: 5.18, ytdReturn: 10.54, accReturn5Y: -14.08 }
        ]
    },
    {
        id: '2024-Q1',
        year: 2024,
        thaiYear: 2567,
        quarter: 1,
        statementDate: '2024-03-31',
        statementDateDisplay: '31/03/2024',
        statementDateThai: '31/03/2567',
        documentNo: 'AERO/00137',
        planCode: 'DIY',
        planName: 'DIY (Fixed Income 40%, Mixed 50%, Foreign Equity 10%)',
        planNameTh: 'DIY สมาชิกเลือกสัดส่วนการลงทุนด้วยตนเอง (DIY)',
        returnRate: 0.49,
        prevYear: {
            memberContribution: 880573.50,
            memberEarnings: 20130.67,
            employerContribution: 734362.50,
            employerEarnings: 17806.82,
            total: 1652873.49
        },
        ytd: {
            memberContribution: 51696.45,
            memberEarnings: 4864.06,
            employerContribution: 51696.45,
            employerEarnings: 3773.59,
            total: 112030.55
        },
        memberContribution: 932269.95,
        memberEarnings: 24994.73,
        employerContribution: 786058.95,
        employerEarnings: 21580.41,
        totalMemberPortion: 957264.68,
        totalEmployerPortion: 807639.36,
        totalBalance: 1764904.04,
        policies: [
            { code: 'AERO1-UOB', nameTh: 'ตราสารหนี้', manager: 'UOB', category: 'Fixed Income', nav: 23.7642, units: 15032.1605, planAllocation: 20.00, actualPortion: 20.24, ytdReturn: 0.93, accReturn5Y: 7.60 },
            { code: 'AERO2-UOB', nameTh: 'ผสม', manager: 'UOB', category: 'Mixed', nav: 42.2767, units: 10459.6486, planAllocation: 25.00, actualPortion: 25.06, ytdReturn: -0.16, accReturn5Y: 3.01 },
            { code: 'AERO3-UOB', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'UOB', category: 'Foreign Equity', nav: 9.9886, units: 9342.4085, planAllocation: 5.00, actualPortion: 5.29, ytdReturn: 5.58, accReturn5Y: -0.11 },
            { code: 'AERO1-TIS', nameTh: 'ตราสารหนี้', manager: 'TISCO', category: 'Fixed Income', nav: 23.2929, units: 15096.0370, planAllocation: 20.00, actualPortion: 19.92, ytdReturn: 0.90, accReturn5Y: 5.47 },
            { code: 'AERO2-TIS', nameTh: 'ผสม', manager: 'TISCO', category: 'Mixed', nav: 41.8235, units: 10178.1590, planAllocation: 25.00, actualPortion: 24.12, ytdReturn: -2.50, accReturn5Y: 1.90 },
            { code: 'AERO3-TIS', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'TISCO', category: 'Foreign Equity', nav: 9.3810, units: 10110.1220, planAllocation: 5.00, actualPortion: 5.37, ytdReturn: 9.19, accReturn5Y: -6.19 }
        ]
    },
    {
        id: '2024-Q2',
        year: 2024,
        thaiYear: 2567,
        quarter: 2,
        statementDate: '2024-06-30',
        statementDateDisplay: '30/06/2024',
        statementDateThai: '30/06/2567',
        documentNo: 'AERO/00138',
        planCode: 'DIY',
        planName: 'DIY (Fixed Income 40%, Mixed 50%, Foreign Equity 10%)',
        planNameTh: 'DIY สมาชิกเลือกสัดส่วนการลงทุนด้วยตนเอง (DIY)',
        returnRate: -1.29,
        prevYear: {
            memberContribution: 880573.50,
            memberEarnings: 20130.67,
            employerContribution: 734362.50,
            employerEarnings: 17806.82,
            total: 1652873.49
        },
        ytd: {
            memberContribution: 105021.45,
            memberEarnings: -12537.55,
            employerContribution: 105021.45,
            employerEarnings: -11525.49,
            total: 185979.86
        },
        memberContribution: 985594.95,
        memberEarnings: 7593.12,
        employerContribution: 839383.95,
        employerEarnings: 6281.33,
        totalMemberPortion: 993188.07,
        totalEmployerPortion: 845665.28,
        totalBalance: 1838853.35,
        policies: [
            { code: 'AERO1-UOB', nameTh: 'ตราสารหนี้', manager: 'UOB', category: 'Fixed Income', nav: 23.8896, units: 15933.6663, planAllocation: 20.00, actualPortion: 20.70, ytdReturn: 1.47, accReturn5Y: 8.17 },
            { code: 'AERO2-UOB', nameTh: 'ผสม', manager: 'UOB', category: 'Mixed', nav: 40.5462, units: 11103.9001, planAllocation: 25.00, actualPortion: 24.48, ytdReturn: -4.25, accReturn5Y: -1.21 },
            { code: 'AERO3-UOB', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'UOB', category: 'Foreign Equity', nav: 10.1590, units: 9880.9060, planAllocation: 5.00, actualPortion: 5.46, ytdReturn: 7.38, accReturn5Y: 1.59 },
            { code: 'AERO1-TIS', nameTh: 'ตราสารหนี้', manager: 'TISCO', category: 'Fixed Income', nav: 23.3977, units: 16016.0344, planAllocation: 20.00, actualPortion: 20.38, ytdReturn: 1.35, accReturn5Y: 5.94 },
            { code: 'AERO2-TIS', nameTh: 'ผสม', manager: 'TISCO', category: 'Mixed', nav: 39.7528, units: 10835.2979, planAllocation: 25.00, actualPortion: 23.42, ytdReturn: -7.33, accReturn5Y: -3.14 },
            { code: 'AERO3-TIS', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'TISCO', category: 'Foreign Equity', nav: 9.5600, units: 10683.2169, planAllocation: 5.00, actualPortion: 5.56, ytdReturn: 11.27, accReturn5Y: -4.40 }
        ]
    },
    {
        id: '2024-Q3',
        year: 2024,
        thaiYear: 2567,
        quarter: 3,
        statementDate: '2024-09-30',
        statementDateDisplay: '30/09/2024',
        statementDateThai: '30/09/2567',
        documentNo: 'AERO/00232',
        planCode: 'DIY',
        planName: 'DIY (Fixed Income 40%, Mixed 50%, Foreign Equity 10%)',
        planNameTh: 'DIY สมาชิกเลือกสัดส่วนการลงทุนด้วยตนเอง (DIY)',
        returnRate: 5.59,
        prevYear: {
            memberContribution: 880573.50,
            memberEarnings: 20130.67,
            employerContribution: 734362.50,
            employerEarnings: 17806.82,
            total: 1652873.49
        },
        ytd: {
            memberContribution: 158346.45,
            memberEarnings: 59911.69,
            employerContribution: 158346.45,
            employerEarnings: 50223.39,
            total: 426827.98
        },
        memberContribution: 1038919.95,
        memberEarnings: 80042.36,
        employerContribution: 892708.95,
        employerEarnings: 68030.21,
        totalMemberPortion: 1118962.31,
        totalEmployerPortion: 960739.16,
        totalBalance: 2079701.47,
        policies: [
            { code: 'AERO1-UOB', nameTh: 'ตราสารหนี้', manager: 'UOB', category: 'Fixed Income', nav: 24.1344, units: 16481.5731, planAllocation: 20.00, actualPortion: 19.13, ytdReturn: 2.51, accReturn5Y: 9.28 },
            { code: 'AERO2-UOB', nameTh: 'ผสม', manager: 'UOB', category: 'Mixed', nav: 44.9322, units: 12114.7547, planAllocation: 25.00, actualPortion: 26.17, ytdReturn: 6.11, accReturn5Y: 9.48 },
            { code: 'AERO3-UOB', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'UOB', category: 'Foreign Equity', nav: 10.4696, units: 9686.5090, planAllocation: 5.00, actualPortion: 4.88, ytdReturn: 10.66, accReturn5Y: 4.70 },
            { code: 'AERO1-TIS', nameTh: 'ตราสารหนี้', manager: 'TISCO', category: 'Fixed Income', nav: 23.6188, units: 16424.1492, planAllocation: 20.00, actualPortion: 18.65, ytdReturn: 2.31, accReturn5Y: 6.94 },
            { code: 'AERO2-TIS', nameTh: 'ผสม', manager: 'TISCO', category: 'Mixed', nav: 45.8004, units: 12040.1215, planAllocation: 25.00, actualPortion: 26.52, ytdReturn: 6.77, accReturn5Y: 11.59 },
            { code: 'AERO3-TIS', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'TISCO', category: 'Foreign Equity', nav: 9.6317, units: 10051.2952, planAllocation: 5.00, actualPortion: 4.65, ytdReturn: 12.10, accReturn5Y: -3.68 }
        ]
    },
    {
        id: '2024-Q4',
        year: 2024,
        thaiYear: 2567,
        quarter: 4,
        statementDate: '2024-12-31',
        statementDateDisplay: '31/12/2024',
        statementDateThai: '31/12/2567',
        documentNo: 'AERO/00145',
        planCode: 'DIY',
        planName: 'DIY (Fixed Income 30%, Mixed 30%, Foreign Equity 40%)',
        planNameTh: 'DIY สมาชิกเลือกสัดส่วนการลงทุนด้วยตนเอง (DIY)',
        returnRate: 2.58,
        prevYear: {
            memberContribution: 880573.50,
            memberEarnings: 20130.67,
            employerContribution: 734362.50,
            employerEarnings: 17806.82,
            total: 1652873.49
        },
        ytd: {
            memberContribution: 213341.40,
            memberEarnings: 29652.98,
            employerContribution: 213341.40,
            employerEarnings: 24022.10,
            total: 480357.88
        },
        memberContribution: 1093914.90,
        memberEarnings: 49783.65,
        employerContribution: 947703.90,
        employerEarnings: 41828.92,
        totalMemberPortion: 1143698.55,
        totalEmployerPortion: 989532.82,
        totalBalance: 2133231.37,
        policies: [
            { code: 'AERO1-UOB', nameTh: 'ตราสารหนี้', manager: 'UOB', category: 'Fixed Income', nav: 24.3814, units: 13137.1993, planAllocation: 15.00, actualPortion: 15.01, ytdReturn: 3.56, accReturn5Y: 10.39 },
            { code: 'AERO2-UOB', nameTh: 'ผสม', manager: 'UOB', category: 'Mixed', nav: 43.3007, units: 7602.9395, planAllocation: 15.00, actualPortion: 15.43, ytdReturn: 2.26, accReturn5Y: 5.50 },
            { code: 'AERO3-UOB', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'UOB', category: 'Foreign Equity', nav: 10.4247, units: 40761.2554, planAllocation: 20.00, actualPortion: 19.92, ytdReturn: 10.19, accReturn5Y: 4.25 },
            { code: 'AERO1-TIS', nameTh: 'ตราสารหนี้', manager: 'TISCO', category: 'Fixed Income', nav: 23.8313, units: 13255.5083, planAllocation: 15.00, actualPortion: 14.81, ytdReturn: 3.23, accReturn5Y: 7.90 },
            { code: 'AERO2-TIS', nameTh: 'ผสม', manager: 'TISCO', category: 'Mixed', nav: 43.6125, units: 7429.3537, planAllocation: 15.00, actualPortion: 15.19, ytdReturn: 1.67, accReturn5Y: 6.26 },
            { code: 'AERO3-TIS', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'TISCO', category: 'Foreign Equity', nav: 9.4938, units: 44121.7323, planAllocation: 20.00, actualPortion: 19.64, ytdReturn: 10.50, accReturn5Y: -5.06 }
        ]
    },
    {
        id: '2025-Q1',
        year: 2025,
        thaiYear: 2568,
        quarter: 1,
        statementDate: '2025-03-31',
        statementDateDisplay: '31/03/2025',
        statementDateThai: '31/03/2568',
        documentNo: 'AERO/00140',
        planCode: 'DIY',
        planName: 'DIY (Fixed Income 30%, Mixed 30%, Foreign Equity 40%)',
        planNameTh: 'DIY สมาชิกเลือกสัดส่วนการลงทุนด้วยตนเอง (DIY)',
        returnRate: -4.91,
        prevYear: {
            memberContribution: 1093914.90,
            memberEarnings: 49783.65,
            employerContribution: 947703.90,
            employerEarnings: 41828.92,
            total: 2133231.37
        },
        ytd: {
            memberContribution: 54994.95,
            memberEarnings: -58557.84,
            employerContribution: 54994.95,
            employerEarnings: -51490.80,
            total: -58.74
        },
        memberContribution: 1148909.85,
        memberEarnings: -8774.19,
        employerContribution: 1002698.85,
        employerEarnings: -9661.88,
        totalMemberPortion: 1140135.66,
        totalEmployerPortion: 993036.97,
        totalBalance: 2133172.63,
        policies: [
            { code: 'AERO1-UOB', nameTh: 'ตราสารหนี้', manager: 'UOB', category: 'Fixed Income', nav: 24.6721, units: 13897.6123, planAllocation: 15.00, actualPortion: 16.07, ytdReturn: 1.19, accReturn5Y: 11.03 },
            { code: 'AERO2-UOB', nameTh: 'ผสม', manager: 'UOB', category: 'Mixed', nav: 36.6711, units: 7864.9944, planAllocation: 15.00, actualPortion: 13.52, ytdReturn: -15.31, accReturn5Y: 22.73 },
            { code: 'AERO3-UOB', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'UOB', category: 'Foreign Equity', nav: 10.0758, units: 43348.5286, planAllocation: 20.00, actualPortion: 20.48, ytdReturn: -3.35, accReturn5Y: 0.76 },
            { code: 'AERO1-TIS', nameTh: 'ตราสารหนี้', manager: 'TISCO', category: 'Fixed Income', nav: 24.1306, units: 14021.0416, planAllocation: 15.00, actualPortion: 15.86, ytdReturn: 1.26, accReturn5Y: 8.65 },
            { code: 'AERO2-TIS', nameTh: 'ผสม', manager: 'TISCO', category: 'Mixed', nav: 38.4924, units: 7692.1384, planAllocation: 15.00, actualPortion: 13.88, ytdReturn: -11.74, accReturn5Y: 29.81 },
            { code: 'AERO3-TIS', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'TISCO', category: 'Foreign Equity', nav: 9.1773, units: 46928.3166, planAllocation: 20.00, actualPortion: 20.19, ytdReturn: -3.33, accReturn5Y: -8.23 }
        ]
    },
    {
        id: '2025-Q2',
        year: 2025,
        thaiYear: 2568,
        quarter: 2,
        statementDate: '2025-06-30',
        statementDateDisplay: '30/06/2025',
        statementDateThai: '30/06/2568',
        documentNo: 'AERO/00135',
        planCode: 'DIY',
        planName: 'DIY (Fixed Income 30%, Mixed 30%, Foreign Equity 40%)',
        planNameTh: 'DIY สมาชิกเลือกสัดส่วนการลงทุนด้วยตนเอง (DIY)',
        returnRate: -3.58,
        prevYear: {
            memberContribution: 1093914.90,
            memberEarnings: 49783.65,
            employerContribution: 947703.90,
            employerEarnings: 41828.92,
            total: 2133231.37
        },
        ytd: {
            memberContribution: 111700.35,
            memberEarnings: -44623.09,
            employerContribution: 111700.35,
            employerEarnings: -39645.59,
            total: 139132.02
        },
        memberContribution: 1205615.25,
        memberEarnings: 5160.56,
        employerContribution: 1059404.25,
        employerEarnings: 2183.33,
        totalMemberPortion: 1210775.81,
        totalEmployerPortion: 1061587.58,
        totalBalance: 2272363.39,
        policies: [
            { code: 'AERO1-UOB', nameTh: 'ตราสารหนี้', manager: 'UOB', category: 'Fixed Income', nav: 24.9483, units: 14584.6020, planAllocation: 15.00, actualPortion: 16.01, ytdReturn: 2.33, accReturn5Y: 12.46 },
            { code: 'AERO2-UOB', nameTh: 'ผสม', manager: 'UOB', category: 'Mixed', nav: 34.1520, units: 8342.9885, planAllocation: 15.00, actualPortion: 12.54, ytdReturn: -21.13, accReturn5Y: -3.79 },
            { code: 'AERO3-UOB', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'UOB', category: 'Foreign Equity', nav: 10.7153, units: 45549.6616, planAllocation: 20.00, actualPortion: 21.48, ytdReturn: 2.79, accReturn5Y: 7.15 },
            { code: 'AERO1-TIS', nameTh: 'ตราสารหนี้', manager: 'TISCO', category: 'Fixed Income', nav: 24.4385, units: 14722.8699, planAllocation: 15.00, actualPortion: 15.83, ytdReturn: 2.55, accReturn5Y: 9.54 },
            { code: 'AERO2-TIS', nameTh: 'ผสม', manager: 'TISCO', category: 'Mixed', nav: 36.4547, units: 8143.4732, planAllocation: 15.00, actualPortion: 13.06, ytdReturn: -16.41, accReturn5Y: -0.49 },
            { code: 'AERO3-TIS', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'TISCO', category: 'Foreign Equity', nav: 9.7039, units: 49343.2131, planAllocation: 20.00, actualPortion: 21.08, ytdReturn: 2.21, accReturn5Y: -2.96 }
        ]
    },
    {
        id: '2025-Q3',
        year: 2025,
        thaiYear: 2568,
        quarter: 3,
        statementDate: '2025-09-30',
        statementDateDisplay: '30/09/2025',
        statementDateThai: '30/09/2568',
        documentNo: 'AERO/00244',
        planCode: 'DIY',
        planName: 'DIY (Fixed Income 30%, Mixed 30%, Foreign Equity 40%)',
        planNameTh: 'DIY สมาชิกเลือกสัดส่วนการลงทุนด้วยตนเอง (DIY)',
        returnRate: 2.19,
        prevYear: {
            memberContribution: 1093914.90,
            memberEarnings: 49783.65,
            employerContribution: 947703.90,
            employerEarnings: 41828.92,
            total: 2133231.37
        },
        ytd: {
            memberContribution: 168405.75,
            memberEarnings: 29375.81,
            employerContribution: 168405.75,
            employerEarnings: 24745.99,
            total: 390933.30
        },
        memberContribution: 1262320.65,
        memberEarnings: 79159.46,
        employerContribution: 1116109.65,
        employerEarnings: 66574.91,
        totalMemberPortion: 1341480.11,
        totalEmployerPortion: 1182684.56,
        totalBalance: 2524164.67,
        policies: [
            { code: 'AERO1-UOB', nameTh: 'ตราสารหนี้', manager: 'UOB', category: 'Fixed Income', nav: 25.1867, units: 14351.1657, planAllocation: 15.00, actualPortion: 14.32, ytdReturn: 3.30, accReturn5Y: 12.51 },
            { code: 'AERO2-UOB', nameTh: 'ผสม', manager: 'UOB', category: 'Mixed', nav: 38.5477, units: 10430.2624, planAllocation: 15.00, actualPortion: 15.93, ytdReturn: -10.98, accReturn5Y: 19.29 },
            { code: 'AERO3-UOB', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'UOB', category: 'Foreign Equity', nav: 11.2692, units: 44505.4994, planAllocation: 20.00, actualPortion: 19.87, ytdReturn: 8.10, accReturn5Y: 12.69 },
            { code: 'AERO1-TIS', nameTh: 'ตราสารหนี้', manager: 'TISCO', category: 'Fixed Income', nav: 24.6297, units: 14634.5250, planAllocation: 15.00, actualPortion: 14.28, ytdReturn: 3.35, accReturn5Y: 10.12 },
            { code: 'AERO2-TIS', nameTh: 'ผสม', manager: 'TISCO', category: 'Mixed', nav: 41.2484, units: 9763.8041, planAllocation: 15.00, actualPortion: 15.96, ytdReturn: -5.42, accReturn5Y: 21.58 },
            { code: 'AERO3-TIS', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'TISCO', category: 'Foreign Equity', nav: 10.0997, units: 49102.1433, planAllocation: 20.00, actualPortion: 19.64, ytdReturn: 6.38, accReturn5Y: 1.00 }
        ]
    },
    {
        id: '2025-Q4',
        year: 2025,
        thaiYear: 2568,
        quarter: 4,
        statementDate: '2025-12-31',
        statementDateDisplay: '31/12/2025',
        statementDateThai: '31/12/2568',
        documentNo: 'AERO/00164',
        planCode: 'DIY',
        planName: 'DIY (Fixed Income 30%, Mixed 30%, Foreign Equity 40%)',
        planNameTh: 'DIY สมาชิกเลือกสัดส่วนการลงทุนด้วยตนเอง (DIY)',
        returnRate: 1.70,
        prevYear: {
            memberContribution: 1093914.90,
            memberEarnings: 49783.65,
            employerContribution: 947703.90,
            employerEarnings: 41828.92,
            total: 2133231.37
        },
        ytd: {
            memberContribution: 226942.65,
            memberEarnings: 24324.28,
            employerContribution: 226942.65,
            employerEarnings: 19768.42,
            total: 497978.00
        },
        memberContribution: 1320857.55,
        memberEarnings: 74107.93,
        employerContribution: 1174646.55,
        employerEarnings: 61597.34,
        totalMemberPortion: 1394965.48,
        totalEmployerPortion: 1236243.89,
        totalBalance: 2631209.37,
        policies: [
            { code: 'AERO1-UOB', nameTh: 'ตราสารหนี้', manager: 'UOB', category: 'Fixed Income', nav: 25.2687, units: 15052.5249, planAllocation: 15.00, actualPortion: 14.46, ytdReturn: 3.64, accReturn5Y: 11.82 },
            { code: 'AERO2-UOB', nameTh: 'ผสม', manager: 'UOB', category: 'Mixed', nav: 37.3748, units: 10893.5641, planAllocation: 15.00, actualPortion: 15.47, ytdReturn: -13.69, accReturn5Y: -0.72 },
            { code: 'AERO3-UOB', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'UOB', category: 'Foreign Equity', nav: 11.4074, units: 46575.0507, planAllocation: 20.00, actualPortion: 20.19, ytdReturn: 9.43, accReturn5Y: 14.07 },
            { code: 'AERO1-TIS', nameTh: 'ตราสารหนี้', manager: 'TISCO', category: 'Fixed Income', nav: 24.6236, units: 15353.2942, planAllocation: 15.00, actualPortion: 14.37, ytdReturn: 3.32, accReturn5Y: 9.31 },
            { code: 'AERO2-TIS', nameTh: 'ผสม', manager: 'TISCO', category: 'Mixed', nav: 39.4362, units: 10207.6256, planAllocation: 15.00, actualPortion: 15.30, ytdReturn: -9.58, accReturn5Y: -0.51 },
            { code: 'AERO3-TIS', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'TISCO', category: 'Foreign Equity', nav: 10.3500, units: 51381.9595, planAllocation: 20.00, actualPortion: 20.21, ytdReturn: 9.02, accReturn5Y: 3.50 }
        ]
    },
    {
        id: '2026-Q1',
        year: 2026,
        thaiYear: 2569,
        quarter: 1,
        statementDate: '2026-03-31',
        statementDateDisplay: '31/03/2026',
        statementDateThai: '31/03/2569',
        documentNo: 'AERO/00163',
        planCode: 'DIY',
        planName: 'DIY (Fixed Income 30%, Mixed 20%, Foreign Equity 50%)',
        planNameTh: 'DIY สมาชิกเลือกสัดส่วนการลงทุนด้วยตนเอง (DIY)',
        returnRate: 0.50,
        prevYear: {
            memberContribution: 1320857.55,
            memberEarnings: 74107.93,
            employerContribution: 1174646.55,
            employerEarnings: 61597.34,
            total: 2631209.37
        },
        ytd: {
            memberContribution: 58536.90,
            memberEarnings: 7583.94,
            employerContribution: 58536.90,
            employerEarnings: 6074.11,
            total: 130731.85
        },
        memberContribution: 1379394.45,
        memberEarnings: 81691.87,
        employerContribution: 1233183.45,
        employerEarnings: 67671.45,
        totalMemberPortion: 1461086.32,
        totalEmployerPortion: 1300854.90,
        totalBalance: 2761941.22,
        policies: [
            { code: 'AERO1-UOB', nameTh: 'ตราสารหนี้', manager: 'UOB', category: 'Fixed Income', nav: 25.1004, units: 16427.2333, planAllocation: 15.00, actualPortion: 14.93, ytdReturn: -0.67, accReturn5Y: 11.03 },
            { code: 'AERO2-UOB', nameTh: 'ผสม', manager: 'UOB', category: 'Mixed', nav: 43.0980, units: 7420.6645, planAllocation: 10.00, actualPortion: 11.58, ytdReturn: 15.31, accReturn5Y: 0.24 },
            { code: 'AERO3-UOB', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'UOB', category: 'Foreign Equity', nav: 10.8556, units: 59713.1381, planAllocation: 25.00, actualPortion: 23.47, ytdReturn: -4.84, accReturn5Y: 8.56 },
            { code: 'AERO1-TIS', nameTh: 'ตราสารหนี้', manager: 'TISCO', category: 'Fixed Income', nav: 24.5613, units: 16783.6518, planAllocation: 15.00, actualPortion: 14.93, ytdReturn: -0.25, accReturn5Y: 9.40 },
            { code: 'AERO2-TIS', nameTh: 'ผสม', manager: 'TISCO', category: 'Mixed', nav: 44.5488, units: 7002.1879, planAllocation: 10.00, actualPortion: 11.29, ytdReturn: 12.96, accReturn5Y: -2.49 },
            { code: 'AERO3-TIS', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'TISCO', category: 'Foreign Equity', nav: 10.0417, units: 65467.5981, planAllocation: 25.00, actualPortion: 23.80, ytdReturn: -2.98, accReturn5Y: 0.42 }
        ]
    },
    {
        id: '2026-Q2',
        year: 2026,
        thaiYear: 2569,
        quarter: 2,
        statementDate: '2026-06-30',
        statementDateDisplay: '30/06/2026',
        statementDateThai: '30/06/2569',
        documentNo: 'AERO/00166',
        planCode: 'DIY',
        planName: 'DIY (Fixed Income 30%, Mixed 20%, Foreign Equity 50%)',
        planNameTh: 'DIY สมาชิกเลือกสัดส่วนการลงทุนด้วยตนเอง (DIY)',
        returnRate: 9.27,
        prevYear: {
            memberContribution: 1320857.55,
            memberEarnings: 74107.93,
            employerContribution: 1174646.55,
            employerEarnings: 61597.34,
            total: 2631209.37
        },
        ytd: {
            memberContribution: 119116.80,
            memberEarnings: 141048.51,
            employerContribution: 119116.80,
            employerEarnings: 124811.71,
            total: 504093.82
        },
        memberContribution: 1439974.35,
        memberEarnings: 215156.44,
        employerContribution: 1293763.35,
        employerEarnings: 186409.05,
        totalMemberPortion: 1655130.79,
        totalEmployerPortion: 1480172.40,
        totalBalance: 3135303.19,
        policies: [
            { code: 'AERO1-UOB', nameTh: 'ตราสารหนี้', manager: 'UOB', category: 'Fixed Income', nav: 25.3510, units: 17148.4857, planAllocation: 15.00, actualPortion: 13.87, ytdReturn: 0.33, accReturn5Y: 11.57 },
            { code: 'AERO2-UOB', nameTh: 'ผสม', manager: 'UOB', category: 'Mixed', nav: 47.1472, units: 7684.8629, planAllocation: 10.00, actualPortion: 11.56, ytdReturn: 26.15, accReturn5Y: 12.86 },
            { code: 'AERO3-UOB', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'UOB', category: 'Foreign Equity', nav: 12.3374, units: 62219.4814, planAllocation: 25.00, actualPortion: 24.48, ytdReturn: 8.15, accReturn5Y: 18.88 },
            { code: 'AERO1-TIS', nameTh: 'ตราสารหนี้', manager: 'TISCO', category: 'Fixed Income', nav: 24.7711, units: 17521.0211, planAllocation: 15.00, actualPortion: 13.84, ytdReturn: 0.60, accReturn5Y: 9.99 },
            { code: 'AERO2-TIS', nameTh: 'ผสม', manager: 'TISCO', category: 'Mixed', nav: 50.2703, units: 7256.6783, planAllocation: 10.00, actualPortion: 11.64, ytdReturn: 27.47, accReturn5Y: 11.26 },
            { code: 'AERO3-TIS', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'TISCO', category: 'Foreign Equity', nav: 11.3166, units: 68202.0368, planAllocation: 25.00, actualPortion: 24.61, ytdReturn: 9.34, accReturn5Y: 9.22 }
        ]
    },
    {
        id: '2026-Q3',
        year: 2026,
        thaiYear: 2569,
        quarter: 3,
        statementDate: '2026-09-30',
        statementDateDisplay: '30/09/2026',
        statementDateThai: '30/09/2569',
        documentNo: 'AERO/00164',
        planCode: 'DIY',
        planName: 'DIY (Fixed Income 30%, Mixed 20%, Foreign Equity 50%)',
        planNameTh: 'DIY สมาชิกเลือกสัดส่วนการลงทุนด้วยตนเอง (DIY)',
        returnRate: 7.91,
        prevYear: {
            memberContribution: 1320857.55,
            memberEarnings: 74107.93,
            employerContribution: 1174646.55,
            employerEarnings: 61597.34,
            total: 2631209.37
        },
        ytd: {
            memberContribution: 179696.70,
            memberEarnings: 125800.81,
            employerContribution: 179696.70,
            employerEarnings: 110748.03,
            total: 595942.24
        },
        memberContribution: 1500554.25,
        memberEarnings: 199908.74,
        employerContribution: 1354343.25,
        employerEarnings: 172345.37,
        totalMemberPortion: 1700462.99,
        totalEmployerPortion: 1526688.62,
        totalBalance: 3227151.61,
        policies: [
            { code: 'AERO1-UOB', nameTh: 'ตราสารหนี้', manager: 'UOB', category: 'Fixed Income', nav: 25.3409, units: 19235.3201, planAllocation: 15.00, actualPortion: 15.10, ytdReturn: 0.29, accReturn5Y: 11.30 },
            { code: 'AERO2-UOB', nameTh: 'ผสม', manager: 'UOB', category: 'Mixed', nav: 46.7237, units: 6891.4984, planAllocation: 10.00, actualPortion: 9.98, ytdReturn: 25.01, accReturn5Y: 9.73 },
            { code: 'AERO3-UOB', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'UOB', category: 'Foreign Equity', nav: 11.7931, units: 65976.2007, planAllocation: 25.00, actualPortion: 24.11, ytdReturn: 3.38, accReturn5Y: 14.10 },
            { code: 'AERO1-TIS', nameTh: 'ตราสารหนี้', manager: 'TISCO', category: 'Fixed Income', nav: 24.7728, units: 19757.4023, planAllocation: 15.00, actualPortion: 15.17, ytdReturn: 0.61, accReturn5Y: 10.01 },
            { code: 'AERO2-TIS', nameTh: 'ผสม', manager: 'TISCO', category: 'Mixed', nav: 51.4236, units: 6479.9924, planAllocation: 10.00, actualPortion: 10.33, ytdReturn: 30.40, accReturn5Y: 8.22 },
            { code: 'AERO3-TIS', nameTh: 'ตราสารทุนต่างประเทศ', manager: 'TISCO', category: 'Foreign Equity', nav: 11.3345, units: 72079.0799, planAllocation: 25.00, actualPortion: 25.31, ytdReturn: 9.51, accReturn5Y: 9.51 }
        ]
    }
];
