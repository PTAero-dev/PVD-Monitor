import type { PVDRecord, PVDPolicy, RetirementGoalConfig } from '../types';
import { POLICY_METADATA } from './mockData';

export interface EnrichedPVDRecord extends PVDRecord {
    periodLabel: string; // e.g. 'Q3/2026'
    shortPeriodLabel: string; // e.g. 'Q3 26'
    totalContributions: number; // ending member + employer contribution
    totalEarnings: number; // ending member + employer earnings
    // True single-quarter cashflow & investment gain
    qMemberContrib: number;
    qEmployerContrib: number;
    qTotalContrib: number;
    qMemberEarnings: number;
    qEmployerEarnings: number;
    qTotalEarnings: number;
    qInvestmentReturnPct: number; // Modified Dietz single-quarter return %
    balanceQoQPct: number;
    balanceYoYPct: number | null;
    profitToPrincipalPct: number;
    wealthMultiplierOnMemberCash: number;
    // Sub-fund category actual portions
    fixedIncomeActualPct: number;
    mixedActualPct: number;
    foreignEquityActualPct: number;
    fixedIncomePlanPct: number;
    mixedPlanPct: number;
    foreignEquityPlanPct: number;
    // Manager split
    uobValue: number;
    tiscoValue: number;
}

export interface YearlySummary {
    year: number;
    thaiYear: number;
    quartersCount: number;
    latestQuarter: number;
    openingBalance: number;
    memberContributionYTD: number;
    employerContributionYTD: number;
    totalContributionYTD: number;
    memberEarningsYTD: number;
    employerEarningsYTD: number;
    totalEarningsYTD: number;
    endingBalance: number;
    iReturnPct: number;
    netBalanceChange: number;
    netBalanceChangePct: number;
    planName: string;
}

export interface PolicyPositionDetail extends PVDPolicy {
    shortName: string;
    nameEn: string;
    color: string;
    riskLevel: string;
    marketValue: number;
    targetValue: number;
    driftPct: number;
    rebalanceAmount: number; // targetValue - marketValue
}

export interface ManagerComparison {
    uobTotalValue: number;
    tiscoTotalValue: number;
    uobSharePct: number;
    tiscoSharePct: number;
    valueDifference: number; // tiscoTotalValue - uobTotalValue
    uobWeightedYtdReturn: number;
    tiscoWeightedYtdReturn: number;
    uobWeighted5YReturn: number;
    tiscoWeighted5YReturn: number;
    categories: {
        category: 'Fixed Income' | 'Mixed' | 'Foreign Equity';
        labelTh: string;
        uobPolicy?: PolicyPositionDetail;
        tiscoPolicy?: PolicyPositionDetail;
        totalCategoryValue: number;
        totalCategoryPlanPct: number;
        totalCategoryActualPct: number;
    }[];
}

export function sortPVDRecords(records: PVDRecord[]): PVDRecord[] {
    return [...records].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.quarter - b.quarter;
    });
}

export function enrichPVDHistory(rawRecords: PVDRecord[]): EnrichedPVDRecord[] {
    const sorted = sortPVDRecords(rawRecords);

    return sorted.map((rec, idx) => {
        const prev = idx > 0 ? sorted[idx - 1] : undefined;
        const prevSameYear = prev && prev.year === rec.year ? prev : undefined;
        const prevYearSameQ = sorted.find(r => r.year === rec.year - 1 && r.quarter === rec.quarter);

        const totalContributions = (rec.memberContribution || 0) + (rec.employerContribution || 0);
        const totalEarnings = (rec.memberEarnings || 0) + (rec.employerEarnings || 0);

        let qMemberContrib = 0;
        let qEmployerContrib = 0;
        let qMemberEarnings = 0;
        let qEmployerEarnings = 0;

        if (rec.ytd) {
            if (rec.quarter === 1 || !prevSameYear || !prevSameYear.ytd) {
                qMemberContrib = rec.ytd.memberContribution;
                qEmployerContrib = rec.ytd.employerContribution;
                qMemberEarnings = rec.ytd.memberEarnings;
                qEmployerEarnings = rec.ytd.employerEarnings;
            } else {
                qMemberContrib = rec.ytd.memberContribution - prevSameYear.ytd.memberContribution;
                qEmployerContrib = rec.ytd.employerContribution - prevSameYear.ytd.employerContribution;
                qMemberEarnings = rec.ytd.memberEarnings - prevSameYear.ytd.memberEarnings;
                qEmployerEarnings = rec.ytd.employerEarnings - prevSameYear.ytd.employerEarnings;
            }
        } else if (prev) {
            qMemberContrib = rec.memberContribution - prev.memberContribution;
            qEmployerContrib = rec.employerContribution - prev.employerContribution;
            qMemberEarnings = rec.memberEarnings - prev.memberEarnings;
            qEmployerEarnings = rec.employerEarnings - prev.employerEarnings;
        }

        const qTotalContrib = qMemberContrib + qEmployerContrib;
        const qTotalEarnings = qMemberEarnings + qEmployerEarnings;

        const openingQuarterBalance = prev
            ? prev.totalBalance
            : (rec.prevYear?.total || (rec.totalBalance - qTotalContrib - qTotalEarnings));

        const investedBase = openingQuarterBalance + 0.5 * qTotalContrib;
        const qInvestmentReturnPct = investedBase > 0 ? (qTotalEarnings / investedBase) * 100 : 0;

        const balanceQoQPct = openingQuarterBalance > 0
            ? ((rec.totalBalance - openingQuarterBalance) / openingQuarterBalance) * 100
            : 0;

        const balanceYoYPct = prevYearSameQ && prevYearSameQ.totalBalance > 0
            ? ((rec.totalBalance - prevYearSameQ.totalBalance) / prevYearSameQ.totalBalance) * 100
            : null;

        const profitToPrincipalPct = totalContributions > 0
            ? (totalEarnings / totalContributions) * 100
            : 0;

        const wealthMultiplierOnMemberCash = rec.memberContribution > 0
            ? rec.totalBalance / rec.memberContribution
            : 0;

        let fixedIncomeActualPct = 0;
        let mixedActualPct = 0;
        let foreignEquityActualPct = 0;
        let fixedIncomePlanPct = 0;
        let mixedPlanPct = 0;
        let foreignEquityPlanPct = 0;
        let uobValue = 0;
        let tiscoValue = 0;

        if (rec.policies && rec.policies.length > 0) {
            rec.policies.forEach(p => {
                const val = p.nav * p.units;
                if (p.manager === 'UOB') uobValue += val;
                if (p.manager === 'TISCO') tiscoValue += val;

                if (p.category === 'Fixed Income') {
                    fixedIncomeActualPct += p.actualPortion;
                    fixedIncomePlanPct += p.planAllocation;
                } else if (p.category === 'Mixed') {
                    mixedActualPct += p.actualPortion;
                    mixedPlanPct += p.planAllocation;
                } else if (p.category === 'Foreign Equity') {
                    foreignEquityActualPct += p.actualPortion;
                    foreignEquityPlanPct += p.planAllocation;
                }
            });
        }

        return {
            ...rec,
            periodLabel: `Q${rec.quarter}/${rec.year}`,
            shortPeriodLabel: `Q${rec.quarter} '${String(rec.year).slice(-2)}`,
            totalContributions,
            totalEarnings,
            qMemberContrib,
            qEmployerContrib,
            qTotalContrib,
            qMemberEarnings,
            qEmployerEarnings,
            qTotalEarnings,
            qInvestmentReturnPct,
            balanceQoQPct,
            balanceYoYPct,
            profitToPrincipalPct,
            wealthMultiplierOnMemberCash,
            fixedIncomeActualPct: Number(fixedIncomeActualPct.toFixed(2)),
            mixedActualPct: Number(mixedActualPct.toFixed(2)),
            foreignEquityActualPct: Number(foreignEquityActualPct.toFixed(2)),
            fixedIncomePlanPct: Number(fixedIncomePlanPct.toFixed(2)),
            mixedPlanPct: Number(mixedPlanPct.toFixed(2)),
            foreignEquityPlanPct: Number(foreignEquityPlanPct.toFixed(2)),
            uobValue: Number(uobValue.toFixed(2)),
            tiscoValue: Number(tiscoValue.toFixed(2)),
        };
    });
}

export function computeYearlySummaries(enriched: EnrichedPVDRecord[]): YearlySummary[] {
    const byYear = new Map<number, EnrichedPVDRecord[]>();
    enriched.forEach(r => {
        const list = byYear.get(r.year) || [];
        list.push(r);
        byYear.set(r.year, list);
    });

    const years = Array.from(byYear.keys()).sort((a, b) => a - b);
    return years.map((year, idx) => {
        const quarters = byYear.get(year)!;
        const lastQ = quarters[quarters.length - 1];
        const prevYearLastQ = idx > 0 ? byYear.get(years[idx - 1])!.slice(-1)[0] : undefined;

        const openingBalance = lastQ.prevYear?.total
            ?? prevYearLastQ?.totalBalance
            ?? ( quarters[0].totalBalance - quarters[0].qTotalContrib - quarters[0].qTotalEarnings );

        const memberContributionYTD = lastQ.ytd
            ? lastQ.ytd.memberContribution
            : quarters.reduce((sum, q) => sum + q.qMemberContrib, 0);

        const employerContributionYTD = lastQ.ytd
            ? lastQ.ytd.employerContribution
            : quarters.reduce((sum, q) => sum + q.qEmployerContrib, 0);

        const memberEarningsYTD = lastQ.ytd
            ? lastQ.ytd.memberEarnings
            : quarters.reduce((sum, q) => sum + q.qMemberEarnings, 0);

        const employerEarningsYTD = lastQ.ytd
            ? lastQ.ytd.employerEarnings
            : quarters.reduce((sum, q) => sum + q.qEmployerEarnings, 0);

        const totalContributionYTD = memberContributionYTD + employerContributionYTD;
        const totalEarningsYTD = memberEarningsYTD + employerEarningsYTD;
        const netBalanceChange = lastQ.totalBalance - openingBalance;
        const netBalanceChangePct = openingBalance > 0 ? (netBalanceChange / openingBalance) * 100 : 0;

        return {
            year,
            thaiYear: lastQ.thaiYear || year + 543,
            quartersCount: quarters.length,
            latestQuarter: lastQ.quarter,
            openingBalance,
            memberContributionYTD,
            employerContributionYTD,
            totalContributionYTD,
            memberEarningsYTD,
            employerEarningsYTD,
            totalEarningsYTD,
            endingBalance: lastQ.totalBalance,
            iReturnPct: lastQ.returnRate || 0,
            netBalanceChange,
            netBalanceChangePct,
            planName: lastQ.planName || lastQ.planCode || 'DIY',
        };
    });
}

export function getPolicyPositions(record: PVDRecord): PolicyPositionDetail[] {
    if (!record.policies || record.policies.length === 0) return [];
    const totalBal = record.totalBalance || 0;

    return record.policies.map(p => {
        const meta = POLICY_METADATA[p.code] || {
            code: p.code,
            shortName: p.code,
            nameEn: p.code,
            nameTh: p.nameTh,
            manager: p.manager,
            category: p.category,
            color: '#6366f1',
            riskLevel: 'Medium'
        };
        const marketValue = Number((p.nav * p.units).toFixed(2));
        const targetValue = Number(((p.planAllocation / 100) * totalBal).toFixed(2));
        const driftPct = Number((p.actualPortion - p.planAllocation).toFixed(2));
        const rebalanceAmount = Number((targetValue - marketValue).toFixed(2));

        return {
            ...p,
            shortName: meta.shortName,
            nameEn: meta.nameEn,
            color: meta.color,
            riskLevel: meta.riskLevel,
            marketValue,
            targetValue,
            driftPct,
            rebalanceAmount,
        };
    });
}

export function computeManagerComparison(record: PVDRecord): ManagerComparison {
    const positions = getPolicyPositions(record);
    const uobPositions = positions.filter(p => p.manager === 'UOB');
    const tiscoPositions = positions.filter(p => p.manager === 'TISCO');

    const uobTotalValue = uobPositions.reduce((s, p) => s + p.marketValue, 0);
    const tiscoTotalValue = tiscoPositions.reduce((s, p) => s + p.marketValue, 0);
    const grandTotal = uobTotalValue + tiscoTotalValue || 1;

    const uobWeightedYtdReturn = uobTotalValue > 0
        ? uobPositions.reduce((s, p) => s + p.ytdReturn * p.marketValue, 0) / uobTotalValue
        : 0;
    const tiscoWeightedYtdReturn = tiscoTotalValue > 0
        ? tiscoPositions.reduce((s, p) => s + p.ytdReturn * p.marketValue, 0) / tiscoTotalValue
        : 0;

    const uobWeighted5YReturn = uobTotalValue > 0
        ? uobPositions.reduce((s, p) => s + (p.accReturn5Y || 0) * p.marketValue, 0) / uobTotalValue
        : 0;
    const tiscoWeighted5YReturn = tiscoTotalValue > 0
        ? tiscoPositions.reduce((s, p) => s + (p.accReturn5Y || 0) * p.marketValue, 0) / tiscoTotalValue
        : 0;

    const categoryDefs: { category: 'Fixed Income' | 'Mixed' | 'Foreign Equity'; labelTh: string }[] = [
        { category: 'Fixed Income', labelTh: 'ตราสารหนี้ (AERO1)' },
        { category: 'Mixed', labelTh: 'นโยบายผสม (AERO2)' },
        { category: 'Foreign Equity', labelTh: 'ตราสารทุนต่างประเทศ (AERO3)' },
    ];

    const categories = categoryDefs.map(def => {
        const uobPolicy = uobPositions.find(p => p.category === def.category);
        const tiscoPolicy = tiscoPositions.find(p => p.category === def.category);
        const totalCategoryValue = (uobPolicy?.marketValue || 0) + (tiscoPolicy?.marketValue || 0);
        const totalCategoryPlanPct = (uobPolicy?.planAllocation || 0) + (tiscoPolicy?.planAllocation || 0);
        const totalCategoryActualPct = (uobPolicy?.actualPortion || 0) + (tiscoPolicy?.actualPortion || 0);

        return {
            category: def.category,
            labelTh: def.labelTh,
            uobPolicy,
            tiscoPolicy,
            totalCategoryValue,
            totalCategoryPlanPct,
            totalCategoryActualPct,
        };
    }).filter(c => c.uobPolicy || c.tiscoPolicy);

    return {
        uobTotalValue,
        tiscoTotalValue,
        uobSharePct: (uobTotalValue / grandTotal) * 100,
        tiscoSharePct: (tiscoTotalValue / grandTotal) * 100,
        valueDifference: tiscoTotalValue - uobTotalValue,
        uobWeightedYtdReturn,
        tiscoWeightedYtdReturn,
        uobWeighted5YReturn,
        tiscoWeighted5YReturn,
        categories,
    };
}

export interface ProjectionPoint {
    year: number;
    age: number;
    projectedBalance: number;
    projectedPrincipal: number;
    projectedEarnings: number;
    annualContribution: number;
    conservativeBalance: number;
    optimisticBalance: number;
}

export function projectRetirementWealth(
    latestRecord: EnrichedPVDRecord,
    config: RetirementGoalConfig
): ProjectionPoint[] {
    const startYear = latestRecord.year;
    const yearsToProject = Math.max(1, config.retirementAge - config.currentAge);

    // Estimate annualized contribution from latest quarter (or YTD)
    const baseQuarterlyContrib = latestRecord.qTotalContrib > 0
        ? latestRecord.qTotalContrib
        : 120000;
    let currentAnnualContrib = baseQuarterlyContrib * 4;

    let balance = latestRecord.totalBalance;
    let conservativeBal = latestRecord.totalBalance;
    let optimisticBal = latestRecord.totalBalance;
    let principal = latestRecord.totalContributions;

    const rBase = config.expectedAnnualReturn / 100;
    const rCons = Math.max(0.01, (config.expectedAnnualReturn - 2.5) / 100);
    const rOpt = (config.expectedAnnualReturn + 2.5) / 100;
    const gContrib = config.annualContributionGrowth / 100;

    const points: ProjectionPoint[] = [
        {
            year: startYear,
            age: config.currentAge,
            projectedBalance: Math.round(balance),
            projectedPrincipal: Math.round(principal),
            projectedEarnings: Math.round(balance - principal),
            annualContribution: Math.round(currentAnnualContrib),
            conservativeBalance: Math.round(conservativeBal),
            optimisticBalance: Math.round(optimisticBal),
        }
    ];

    for (let i = 1; i <= yearsToProject; i++) {
        if (i > 1) {
            currentAnnualContrib = currentAnnualContrib * (1 + gContrib);
        }
        principal += currentAnnualContrib;
        balance = (balance + currentAnnualContrib * 0.5) * (1 + rBase) + currentAnnualContrib * 0.5;
        conservativeBal = (conservativeBal + currentAnnualContrib * 0.5) * (1 + rCons) + currentAnnualContrib * 0.5;
        optimisticBal = (optimisticBal + currentAnnualContrib * 0.5) * (1 + rOpt) + currentAnnualContrib * 0.5;

        points.push({
            year: startYear + i,
            age: config.currentAge + i,
            projectedBalance: Math.round(balance),
            projectedPrincipal: Math.round(principal),
            projectedEarnings: Math.round(balance - principal),
            annualContribution: Math.round(currentAnnualContrib),
            conservativeBalance: Math.round(conservativeBal),
            optimisticBalance: Math.round(optimisticBal),
        });
    }

    return points;
}
