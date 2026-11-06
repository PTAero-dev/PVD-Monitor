import React, { useState, useEffect, useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import {
    Calculator,
    Target,
    Sparkles,
    ShieldCheck,
    CloudUpload,
    Check,
    TrendingUp,
    Calendar,
    Award,
    Coins
} from 'lucide-react';
import type { EnrichedPVDRecord } from '../utils/analytics';
import { projectRetirementWealth } from '../utils/analytics';
import type { RetirementGoalConfig } from '../types';
import { saveRetirementGoalToCloud, loadRetirementGoalFromCloud } from '../utils/firebase';

interface WealthSimulatorProps {
    records: EnrichedPVDRecord[];
}

const formatTHB = (val: number, maxDecimals = 0) =>
    new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: maxDecimals
    }).format(val);

const MILESTONES = [5_000_000, 10_000_000, 15_000_000, 20_000_000];

const WealthSimulator: React.FC<WealthSimulatorProps> = ({ records }) => {
    const latestRecord = records[records.length - 1];

    const [config, setConfig] = useState<RetirementGoalConfig>(() => {
        const savedLocal = localStorage.getItem('pvd_retirement_goal');
        if (savedLocal) {
            try {
                return JSON.parse(savedLocal);
            } catch {
                // ignore
            }
        }
        return {
            currentAge: 38,
            retirementAge: 60,
            expectedAnnualReturn: 6.5,
            annualContributionGrowth: 4.0,
            targetAmount: 15_000_000
        };
    });

    const [taxBracket, setTaxBracket] = useState<number>(20); // 20% default Thai marginal tax rate
    const [savingCloud, setSavingCloud] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);

    useEffect(() => {
        let mounted = true;
        loadRetirementGoalFromCloud().then(cloudGoal => {
            if (mounted && cloudGoal) {
                setConfig(cloudGoal);
                localStorage.setItem('pvd_retirement_goal', JSON.stringify(cloudGoal));
            }
        });
        return () => {
            mounted = false;
        };
    }, []);

    const handleConfigChange = (key: keyof RetirementGoalConfig, value: number) => {
        setConfig(prev => {
            const next = { ...prev, [key]: value };
            localStorage.setItem('pvd_retirement_goal', JSON.stringify(next));
            return next;
        });
        setSavedSuccess(false);
    };

    const handleSaveGoal = async () => {
        setSavingCloud(true);
        try {
            await saveRetirementGoalToCloud(config);
            localStorage.setItem('pvd_retirement_goal', JSON.stringify(config));
            setSavedSuccess(true);
            setTimeout(() => setSavedSuccess(false), 2500);
        } catch (e) {
            console.warn('Could not save goal to cloud:', e);
        } finally {
            setSavingCloud(false);
        }
    };

    const projection = useMemo(() => {
        if (!latestRecord) return [];
        return projectRetirementWealth(latestRecord, config);
    }, [latestRecord, config]);

    if (!latestRecord || projection.length === 0) {
        return <div className="card" style={{ padding: '2rem' }}>No PVD data available for simulation.</div>;
    }

    const finalPoint = projection[projection.length - 1];
    const targetAchievementPct = config.targetAmount > 0
        ? Math.min(200, (finalPoint.projectedBalance / config.targetAmount) * 100)
        : 100;

    // 4% Safe Withdrawal Rate & 20-Yr Annuity (at 3.5% real post-retirement return)
    const monthlySWR4Pct = (finalPoint.projectedBalance * 0.04) / 12;
    const rMonthly = 0.035 / 12;
    const nMonths = 20 * 12;
    const monthly20YrAnnuity =
        (finalPoint.projectedBalance * rMonthly) / (1 - Math.pow(1 + rMonthly, -nMonths));

    // Annualized member & employer contribution from latest year/quarter
    const annualizedMemberContrib = latestRecord.ytd
        ? (latestRecord.ytd.memberContribution / latestRecord.quarter) * 4
        : latestRecord.qMemberContrib * 4;
    const annualizedEmployerContrib = latestRecord.ytd
        ? (latestRecord.ytd.employerContribution / latestRecord.quarter) * 4
        : latestRecord.qEmployerContrib * 4;

    const deductibleMemberContrib = Math.min(500_000, annualizedMemberContrib);
    const annualTaxSaved = deductibleMemberContrib * (taxBracket / 100);
    const netOutOfPocketCost = annualizedMemberContrib - annualTaxSaved;
    const instantTotalBenefit = annualizedEmployerContrib + annualTaxSaved;
    const instantEffectiveROI = netOutOfPocketCost > 0
        ? (instantTotalBenefit / netOutOfPocketCost) * 100
        : 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Top Banner */}
            <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span className="badge badge-primary">RETIREMENT & TAX SIMULATOR</span>
                            <span className="badge badge-success">Starting Base: {latestRecord.periodLabel} ({formatTHB(latestRecord.totalBalance)})</span>
                        </div>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                            PVD Wealth Trajectory & Tax Shield Simulator
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                            Model compound growth to retirement, milestone crossings, monthly retirement income, and Thai Revenue Code tax benefits
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <div className="segmented-control">
                            <button
                                className={`segmented-btn ${config.expectedAnnualReturn === 4.5 ? 'active' : ''}`}
                                onClick={() => handleConfigChange('expectedAnnualReturn', 4.5)}
                            >
                                Conservative (4.5%)
                            </button>
                            <button
                                className={`segmented-btn ${config.expectedAnnualReturn === 6.5 ? 'active' : ''}`}
                                onClick={() => handleConfigChange('expectedAnnualReturn', 6.5)}
                            >
                                Balanced (6.5%)
                            </button>
                            <button
                                className={`segmented-btn ${config.expectedAnnualReturn === 8.5 ? 'active' : ''}`}
                                onClick={() => handleConfigChange('expectedAnnualReturn', 8.5)}
                            >
                                Growth (8.5%)
                            </button>
                        </div>

                        <button
                            onClick={handleSaveGoal}
                            disabled={savingCloud}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                                padding: '0.55rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                background: savedSuccess ? 'var(--color-success)' : 'var(--color-primary)',
                                color: '#fff',
                                fontSize: '0.82rem',
                                fontWeight: 600
                            }}
                        >
                            {savedSuccess ? <Check size={16} /> : <CloudUpload size={16} />}
                            {savingCloud ? 'Saving...' : savedSuccess ? 'Saved to Cloud' : 'Save Parameters'}
                        </button>
                    </div>
                </div>
            </div>

            {/* 4 Executive Outcome Cards */}
            <div className="kpi-grid">
                <div className="card" style={{ padding: '1.25rem', borderTop: '3px solid #3b82f6' }}>
                    <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                            Projected at Age {config.retirementAge} ({finalPoint.year})
                        </span>
                        <Target size={18} color="#3b82f6" />
                    </div>
                    <div className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '0.35rem' }}>
                        {formatTHB(finalPoint.projectedBalance)}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '0.6rem' }}>
                        Range: <strong className="tabular-nums">{formatTHB(finalPoint.conservativeBalance)}</strong> – <strong className="tabular-nums">{formatTHB(finalPoint.optimisticBalance)}</strong>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--color-bg-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${Math.min(100, targetAchievementPct)}%`,
                            height: '100%',
                            background: targetAchievementPct >= 100 ? 'var(--color-success)' : 'var(--color-primary)'
                        }} />
                    </div>
                    <div className="flex-between" style={{ marginTop: '0.35rem', fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                        <span>Target: {formatTHB(config.targetAmount)}</span>
                        <span style={{ fontWeight: 700, color: targetAchievementPct >= 100 ? 'var(--color-success)' : 'var(--color-primary)' }}>
                            {targetAchievementPct.toFixed(1)}% of Goal
                        </span>
                    </div>
                </div>

                <div className="card" style={{ padding: '1.25rem', borderTop: '3px solid #10b981' }}>
                    <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                            Projected Investment Profit
                        </span>
                        <TrendingUp size={18} color="#10b981" />
                    </div>
                    <div className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-success)', marginBottom: '0.35rem' }}>
                        +{formatTHB(finalPoint.projectedEarnings)}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '0.6rem' }}>
                        Total Principal Contributed: <strong className="tabular-nums">{formatTHB(finalPoint.projectedPrincipal)}</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--color-border-subtle)' }}>
                        Compound growth generates <strong>{((finalPoint.projectedEarnings / finalPoint.projectedBalance) * 100).toFixed(1)}%</strong> of final retirement wealth
                    </div>
                </div>

                <div className="card" style={{ padding: '1.25rem', borderTop: '3px solid #8b5cf6' }}>
                    <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                            Est. Monthly Retirement Income
                        </span>
                        <Coins size={18} color="#8b5cf6" />
                    </div>
                    <div className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#8b5cf6', marginBottom: '0.35rem' }}>
                        {formatTHB(monthly20YrAnnuity)}<span style={{ fontSize: '0.85rem', fontWeight: 600 }}>/mo</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '0.6rem' }}>
                        20-Year Drawdown (at 3.5% p.a. yield)
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--color-border-subtle)' }}>
                        Perpetual 4% SWR: <strong className="tabular-nums" style={{ color: 'var(--color-text-main)' }}>{formatTHB(monthlySWR4Pct)}/mo</strong> (never depletes principal)
                    </div>
                </div>

                <div className="card" style={{ padding: '1.25rem', borderTop: '3px solid #f59e0b' }}>
                    <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                            Instant Tax + Match Advantage
                        </span>
                        <ShieldCheck size={18} color="#f59e0b" />
                    </div>
                    <div className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b', marginBottom: '0.35rem' }}>
                        +{instantEffectiveROI.toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '0.6rem' }}>
                        Risk-free Day-1 gain on net out-of-pocket savings
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--color-border-subtle)' }}>
                        Tax Rebate: <strong style={{ color: 'var(--color-success)' }}>{formatTHB(annualTaxSaved)}/yr</strong> + AEROTHAI Match: <strong style={{ color: 'var(--color-primary)' }}>{formatTHB(annualizedEmployerContrib)}/yr</strong>
                    </div>
                </div>
            </div>

            {/* Controls + Trajectory Chart */}
            <div className="charts-grid-2">
                {/* Left: Interactive Sliders */}
                <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calculator size={18} color="var(--color-primary)" />
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Simulation Assumptions</h3>
                    </div>

                    {/* Current Age & Retirement Age */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <div className="flex-between" style={{ marginBottom: '0.3rem' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Current Age</label>
                                <span className="badge badge-primary tabular-nums">{config.currentAge} yrs</span>
                            </div>
                            <input
                                type="range"
                                min={25}
                                max={59}
                                value={config.currentAge}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    handleConfigChange('currentAge', val);
                                    if (val >= config.retirementAge) {
                                        handleConfigChange('retirementAge', val + 1);
                                    }
                                }}
                                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                            />
                        </div>

                        <div>
                            <div className="flex-between" style={{ marginBottom: '0.3rem' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Retirement Age</label>
                                <span className="badge badge-primary tabular-nums">{config.retirementAge} yrs</span>
                            </div>
                            <input
                                type="range"
                                min={Math.max(45, config.currentAge + 1)}
                                max={65}
                                value={config.retirementAge}
                                onChange={(e) => handleConfigChange('retirementAge', Number(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                            />
                        </div>
                    </div>

                    {/* Expected Annual Return */}
                    <div>
                        <div className="flex-between" style={{ marginBottom: '0.3rem' }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                Expected Annual Portfolio Return (CAGR)
                            </label>
                            <span className="badge badge-success tabular-nums">{config.expectedAnnualReturn.toFixed(1)}% / yr</span>
                        </div>
                        <input
                            type="range"
                            min={2.0}
                            max={12.0}
                            step={0.5}
                            value={config.expectedAnnualReturn}
                            onChange={(e) => handleConfigChange('expectedAnnualReturn', Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#10b981' }}
                        />
                        <div className="flex-between" style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                            <span>2.0% (Fixed Income)</span>
                            <span>2026 YTD i-Return: +7.91%</span>
                            <span>12.0% (Global Bull)</span>
                        </div>
                    </div>

                    {/* Annual Salary / Contribution Growth */}
                    <div>
                        <div className="flex-between" style={{ marginBottom: '0.3rem' }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                Annual Salary / Contribution Growth Rate
                            </label>
                            <span className="badge badge-primary tabular-nums">{config.annualContributionGrowth.toFixed(1)}% / yr</span>
                        </div>
                        <input
                            type="range"
                            min={0.0}
                            max={8.0}
                            step={0.5}
                            value={config.annualContributionGrowth}
                            onChange={(e) => handleConfigChange('annualContributionGrowth', Number(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                        />
                        <div className="flex-between" style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                            <span>0% (Flat Salary)</span>
                            <span>AEROTHAI Step ~4-5%/yr</span>
                            <span>8.0% (Fast Track)</span>
                        </div>
                    </div>

                    {/* Target Retirement Goal */}
                    <div>
                        <div className="flex-between" style={{ marginBottom: '0.3rem' }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                Target PVD Goal at Retirement
                            </label>
                            <span className="badge badge-warning tabular-nums">{formatTHB(config.targetAmount)}</span>
                        </div>
                        <input
                            type="range"
                            min={5_000_000}
                            max={30_000_000}
                            step={1_000_000}
                            value={config.targetAmount}
                            onChange={(e) => handleConfigChange('targetAmount', Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#f59e0b' }}
                        />
                        <div className="flex-between" style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                            <span>฿5M</span>
                            <span>฿15M</span>
                            <span>฿30M</span>
                        </div>
                    </div>

                    {/* Milestone Crossings Box */}
                    <div style={{
                        marginTop: '0.25rem',
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-bg-subtle)',
                        border: '1px solid var(--color-border)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem', fontSize: '0.8rem', fontWeight: 700 }}>
                            <Award size={15} color="#f59e0b" />
                            <span>Projected Wealth Milestone Crossings</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
                            {MILESTONES.map(m => {
                                const hit = projection.find(p => p.projectedBalance >= m);
                                return (
                                    <div key={m} style={{
                                        padding: '0.55rem 0.75rem',
                                        borderRadius: 'var(--radius-sm)',
                                        background: 'var(--color-surface)',
                                        border: '1px solid var(--color-border-subtle)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--color-text-main)' }}>
                                            ฿{(m / 1_000_000).toFixed(0)}M
                                        </span>
                                        {hit ? (
                                            <span style={{ fontSize: '0.76rem', color: 'var(--color-success)', fontWeight: 600 }}>
                                                Year {hit.year} (Age {hit.age})
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                                                After Age {config.retirementAge}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Wealth Cone / Fan Chart */}
                <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div className="flex-between" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                                Retirement Wealth Cone ({latestRecord.year} – {finalPoint.year})
                            </h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                Comparing Expected Base ({config.expectedAnnualReturn}%), Optimistic ({(config.expectedAnnualReturn + 2.5).toFixed(1)}%), Conservative ({Math.max(1, config.expectedAnnualReturn - 2.5).toFixed(1)}%), and Principal Only
                            </p>
                        </div>
                        <span className="badge badge-primary">
                            Horizon: {config.retirementAge - config.currentAge} Years
                        </span>
                    </div>

                    <div style={{ width: '100%', height: '340px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={projection} margin={{ top: 10, right: 20, left: 5, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="gradOpt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                                    </linearGradient>
                                    <linearGradient id="gradBase" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.32} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                                    </linearGradient>
                                    <linearGradient id="gradPrin" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#64748b" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#64748b" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis
                                    dataKey="year"
                                    tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(yr) => `${yr}`}
                                />
                                <YAxis
                                    tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => `฿${(v / 1_000_000).toFixed(1)}M`}
                                />
                                <Tooltip
                                    formatter={(val: any, name: any) => [formatTHB(Number(val)), name]}
                                    labelFormatter={(yr, payload) => {
                                        const pt = payload?.[0]?.payload;
                                        return pt ? `Year ${yr} (Age ${pt.age})` : `Year ${yr}`;
                                    }}
                                    contentStyle={{
                                        background: 'var(--color-surface)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '10px'
                                    }}
                                />
                                <ReferenceLine
                                    y={config.targetAmount}
                                    stroke="#f59e0b"
                                    strokeDasharray="5 5"
                                    label={{
                                        value: `Goal: ฿${(config.targetAmount / 1_000_000).toFixed(0)}M`,
                                        position: 'insideTopLeft',
                                        fill: '#f59e0b',
                                        fontSize: 11,
                                        fontWeight: 700
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="optimisticBalance"
                                    name={`Optimistic (${(config.expectedAnnualReturn + 2.5).toFixed(1)}%)`}
                                    stroke="#10b981"
                                    strokeWidth={1.5}
                                    strokeDasharray="4 4"
                                    fill="url(#gradOpt)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="projectedBalance"
                                    name={`Expected Base (${config.expectedAnnualReturn.toFixed(1)}%)`}
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fill="url(#gradBase)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="conservativeBalance"
                                    name={`Conservative (${Math.max(1, config.expectedAnnualReturn - 2.5).toFixed(1)}%)`}
                                    stroke="#f59e0b"
                                    strokeWidth={1.5}
                                    strokeDasharray="3 3"
                                    fill="none"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="projectedPrincipal"
                                    name="Cumulative Principal"
                                    stroke="#64748b"
                                    strokeWidth={2}
                                    fill="url(#gradPrin)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Thai Revenue Code Tax Shield & AEROTHAI Match Breakdown */}
            <div className="card" style={{ padding: '1.5rem' }}>
                <div className="flex-between" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles size={18} color="#10b981" />
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                                Thai PVD Tax Deduction & AEROTHAI Matching Analyzer ({latestRecord.year})
                            </h3>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                            PVD contributions are deductible up to 15% of wage (capped at ฿500,000/year) under Thai Revenue Code
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Marginal Tax Bracket:</span>
                        <div className="segmented-control">
                            {[10, 15, 20, 25, 30, 35].map(rate => (
                                <button
                                    key={rate}
                                    className={`segmented-btn ${taxBracket === rate ? 'active' : ''}`}
                                    onClick={() => setTaxBracket(rate)}
                                >
                                    {rate}%
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                            2026 YTD Member Contribution ({latestRecord.quarter} Quarters)
                        </div>
                        <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                            {formatTHB(latestRecord.ytd?.memberContribution || 0, 2)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                            Est. Full-Year: <strong className="tabular-nums">{formatTHB(annualizedMemberContrib, 2)}</strong> / ฿500,000 cap
                        </div>
                    </div>

                    <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                            Annual Personal Income Tax Saved ({taxBracket}% Bracket)
                        </div>
                        <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-success)' }}>
                            +{formatTHB(annualTaxSaved, 2)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                            YTD Tax Shield Locked In: <strong className="tabular-nums">{formatTHB((latestRecord.ytd?.memberContribution || 0) * (taxBracket / 100), 2)}</strong>
                        </div>
                    </div>

                    <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                            Annual AEROTHAI Employer Match (100%)
                        </div>
                        <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                            +{formatTHB(annualizedEmployerContrib, 2)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                            1:1 matching contribution added to your account
                        </div>
                    </div>

                    <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                            Net Out-of-Pocket vs Total Annual Wealth Added
                        </div>
                        <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>
                            {formatTHB(netOutOfPocketCost)} → {formatTHB(annualizedMemberContrib + annualizedEmployerContrib)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                            Every ฿1 net cost creates <strong>฿{((annualizedMemberContrib + annualizedEmployerContrib) / (netOutOfPocketCost || 1)).toFixed(2)}</strong> in PVD
                        </div>
                    </div>
                </div>
            </div>

            {/* Year-by-Year Projection Schedule */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <div className="flex-between" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={18} color="var(--color-primary)" />
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                            Year-by-Year Retirement Projection Schedule (Age {config.currentAge} – {config.retirementAge})
                        </h3>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                        Assumes {config.expectedAnnualReturn}% annual return & {config.annualContributionGrowth}% annual contribution step-up
                    </span>
                </div>
                <div className="table-scroll" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                    <table className="data-table">
                        <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
                            <tr>
                                <th>Year (A.D. / B.E.)</th>
                                <th>Member Age</th>
                                <th className="num">Est. Annual Inflow (Member+Employer)</th>
                                <th className="num">Cumulative Principal</th>
                                <th className="num">Projected Cumulative Profit</th>
                                <th className="num">Conservative (-2.5%)</th>
                                <th className="num">Expected Balance ({config.expectedAnnualReturn}%)</th>
                                <th className="num">Optimistic (+2.5%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projection.map((pt, idx) => {
                                const isGoalReached = pt.projectedBalance >= config.targetAmount &&
                                    (idx === 0 || projection[idx - 1].projectedBalance < config.targetAmount);
                                return (
                                    <tr key={pt.year} style={isGoalReached ? { background: 'var(--color-success-bg)' } : undefined}>
                                        <td style={{ fontWeight: 700 }}>
                                            {pt.year} / {pt.year + 543}
                                            {idx === 0 && <span className="badge badge-primary" style={{ marginLeft: '0.5rem' }}>Current</span>}
                                            {isGoalReached && <span className="badge badge-success" style={{ marginLeft: '0.5rem' }}>Goal Reached</span>}
                                        </td>
                                        <td>Age {pt.age}</td>
                                        <td className="num">{formatTHB(pt.annualContribution)}</td>
                                        <td className="num">{formatTHB(pt.projectedPrincipal)}</td>
                                        <td className="num" style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                                            +{formatTHB(pt.projectedEarnings)}
                                        </td>
                                        <td className="num" style={{ color: 'var(--color-text-secondary)' }}>
                                            {formatTHB(pt.conservativeBalance)}
                                        </td>
                                        <td className="num" style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
                                            {formatTHB(pt.projectedBalance)}
                                        </td>
                                        <td className="num" style={{ color: 'var(--color-success)' }}>
                                            {formatTHB(pt.optimisticBalance)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WealthSimulator;
