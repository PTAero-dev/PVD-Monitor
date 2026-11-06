import React, { useState, useMemo } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    AreaChart,
    Area,
    Legend
} from 'recharts';
import {
    ChevronLeft,
    ChevronRight,
    Award,
    Scale,
    TrendingUp,
    Layers
} from 'lucide-react';
import type { EnrichedPVDRecord } from '../utils/analytics';
import { getPolicyPositions, computeManagerComparison } from '../utils/analytics';
import { POLICY_METADATA } from '../utils/mockData';

interface PolicyAnalyticsViewProps {
    records: EnrichedPVDRecord[];
}

const formatTHB = (val: number) =>
    new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(val);

const CATEGORY_COLORS: Record<string, string> = {
    'Fixed Income': '#0ea5e9',
    'Mixed': '#8b5cf6',
    'Foreign Equity': '#10b981'
};

const PolicyAnalyticsView: React.FC<PolicyAnalyticsViewProps> = ({ records }) => {
    const [selectedIdx, setSelectedIdx] = useState<number>(Math.max(0, records.length - 1));
    const [donutMode, setDonutMode] = useState<'category' | 'subfund'>('category');
    const [navMode, setNavMode] = useState<'indexed' | 'raw'>('indexed');

    // Keep index valid if records array changes
    const safeIdx = Math.min(Math.max(0, selectedIdx), Math.max(0, records.length - 1));
    const currentRecord = records[safeIdx];

    const positions = useMemo(
        () => (currentRecord ? getPolicyPositions(currentRecord) : []),
        [currentRecord]
    );

    const managerComp = useMemo(
        () => (currentRecord ? computeManagerComparison(currentRecord) : null),
        [currentRecord]
    );

    // Donut data
    const donutData = useMemo(() => {
        if (donutMode === 'subfund') {
            return positions.map(p => ({
                name: p.code,
                fullName: `${p.code} (${p.nameTh})`,
                value: p.marketValue,
                pct: p.actualPortion,
                planPct: p.planAllocation,
                color: p.color
            }));
        }
        const catMap = new Map<string, { value: number; pct: number; planPct: number }>();
        positions.forEach(p => {
            const prev = catMap.get(p.category) || { value: 0, pct: 0, planPct: 0 };
            catMap.set(p.category, {
                value: prev.value + p.marketValue,
                pct: Number((prev.pct + p.actualPortion).toFixed(2)),
                planPct: Number((prev.planPct + p.planAllocation).toFixed(2))
            });
        });
        return Array.from(catMap.entries()).map(([cat, stats]) => ({
            name: cat,
            fullName: cat === 'Fixed Income' ? 'Fixed Income (ตราสารหนี้)' : cat === 'Mixed' ? 'Mixed (นโยบายผสม)' : 'Foreign Equity (ตราสารทุนต่างประเทศ)',
            value: stats.value,
            pct: stats.pct,
            planPct: stats.planPct,
            color: CATEGORY_COLORS[cat] || '#6366f1'
        }));
    }, [positions, donutMode]);

    // Historical NAV chart data across all 27 quarters
    const navHistoryData = useMemo(() => {
        const baseNavs: Record<string, number> = {};
        records.forEach(r => {
            r.policies?.forEach(p => {
                if (baseNavs[p.code] === undefined && p.nav > 0) {
                    baseNavs[p.code] = p.nav;
                }
            });
        });

        return records.map(r => {
            const row: Record<string, any> = {
                period: r.periodLabel,
                shortPeriod: r.shortPeriodLabel,
            };
            r.policies?.forEach(p => {
                if (navMode === 'raw') {
                    row[p.code] = p.nav;
                } else {
                    const base = baseNavs[p.code] || p.nav;
                    row[p.code] = Number(((p.nav / base) * 100).toFixed(2));
                }
            });
            return row;
        });
    }, [records, navMode]);

    if (!currentRecord) {
        return <div className="card" style={{ padding: '2rem' }}>No policy data available.</div>;
    }

    const winnerManager = managerComp && managerComp.tiscoTotalValue >= managerComp.uobTotalValue ? 'TISCO' : 'UOBAM';
    const winnerDiff = managerComp ? Math.abs(managerComp.valueDifference) : 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Top Quarter Selector & Plan Banner */}
            <div className="card" style={{ padding: '1.15rem 1.35rem' }}>
                <div className="flex-between">
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                            <h2 style={{ fontSize: '1.25rem' }}>Sub-Fund Policy & Manager Analytics</h2>
                            <span style={{
                                padding: '3px 10px',
                                borderRadius: '999px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background: 'var(--color-primary-soft)',
                                color: 'var(--color-primary-light)',
                                border: '1px solid rgba(99, 102, 241, 0.3)'
                            }}>
                                {currentRecord.planName || currentRecord.planCode || 'DIY Plan'}
                            </span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                            Statement as of <strong>{currentRecord.statementDateDisplay || currentRecord.statementDate}</strong> (Doc: {currentRecord.documentNo || '-'}) • Total NAV: <strong>{formatTHB(currentRecord.totalBalance)}</strong>
                        </p>
                    </div>

                    {/* Quarter Selector Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                            className="btn-secondary"
                            onClick={() => setSelectedIdx(prev => Math.max(0, prev - 1))}
                            disabled={safeIdx === 0}
                            style={{ padding: '0.45rem 0.65rem' }}
                            title="Previous Quarter"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <select
                            value={safeIdx}
                            onChange={(e) => setSelectedIdx(Number(e.target.value))}
                            style={{
                                padding: '0.48rem 0.85rem',
                                borderRadius: '8px',
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-bg-elevated)',
                                color: 'var(--color-text-main)',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                            }}
                        >
                            {records.map((r, i) => (
                                <option key={r.id} value={i}>
                                    {r.periodLabel} ({r.statementDateDisplay || r.statementDate})
                                </option>
                            ))}
                        </select>
                        <button
                            className="btn-secondary"
                            onClick={() => setSelectedIdx(prev => Math.min(records.length - 1, prev + 1))}
                            disabled={safeIdx === records.length - 1}
                            style={{ padding: '0.45rem 0.65rem' }}
                            title="Next Quarter"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Section 1: Donut Chart + 6-Policy Drift Table */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.25rem'
            }}>
                {/* Left: Asset Allocation Donut */}
                <div className="card" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.05rem' }}>Portfolio Allocation ({currentRecord.periodLabel})</h3>
                            <p style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>
                                Actual market value weight vs. target plan weight
                            </p>
                        </div>
                        <div className="pill-toggle-group">
                            <button
                                className={`pill-toggle-btn ${donutMode === 'category' ? 'active' : ''}`}
                                onClick={() => setDonutMode('category')}
                            >
                                Asset Class
                            </button>
                            <button
                                className={`pill-toggle-btn ${donutMode === 'subfund' ? 'active' : ''}`}
                                onClick={() => setDonutMode('subfund')}
                            >
                                6 Sub-Funds
                            </button>
                        </div>
                    </div>

                    <div style={{ height: '250px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={donutData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={64}
                                    outerRadius={96}
                                    paddingAngle={3}
                                >
                                    {donutData.map((entry, idx) => (
                                        <Cell key={idx} fill={entry.color} stroke="var(--color-surface)" strokeWidth={2} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(val: any, _name: any, props: any) => [
                                        `${formatTHB(Number(val))} (${props.payload.pct}% actual vs ${props.payload.planPct}% plan)`,
                                        props.payload.fullName
                                    ]}
                                    contentStyle={{
                                        background: 'var(--color-surface)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '8px',
                                        color: 'var(--color-text-main)',
                                        fontSize: '0.82rem'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend list with Target vs Actual */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {donutData.map((d) => {
                            const drift = Number((d.pct - d.planPct).toFixed(2));
                            return (
                                <div
                                    key={d.name}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.45rem 0.65rem',
                                        background: 'var(--color-bg-elevated)',
                                        borderRadius: '8px',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: d.color, display: 'inline-block' }} />
                                        <span style={{ fontWeight: 600 }}>{d.fullName}</span>
                                    </div>
                                    <div className="tabular-nums" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ color: 'var(--color-text-secondary)' }}>
                                            Plan <strong>{d.planPct.toFixed(0)}%</strong> → Actual <strong>{d.pct.toFixed(2)}%</strong>
                                        </span>
                                        <span style={{
                                            fontWeight: 700,
                                            color: Math.abs(drift) < 0.5 ? 'var(--color-text-muted)' : drift > 0 ? '#f59e0b' : '#38bdf8'
                                        }}>
                                            ({drift > 0 ? '+' : ''}{drift.toFixed(2)}%)
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: UOBAM vs TISCO Co-Management Head-to-Head Card */}
                {managerComp && (
                    <div className="card" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                        <div>
                            <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Award size={19} color="#f59e0b" />
                                    <h3 style={{ fontSize: '1.05rem' }}>UOBAM vs. TISCO Co-Manager Battle</h3>
                                </div>
                                <span style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                    borderRadius: '999px',
                                    background: 'rgba(16, 185, 129, 0.14)',
                                    color: '#10b981'
                                }}>
                                    {winnerManager} Leads by +{formatTHB(winnerDiff)}
                                </span>
                            </div>
                            <p style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>
                                Contributions are split equally 50% UOBAM / 50% TISCO. Differences in market value reflect pure investment performance alpha.
                            </p>
                        </div>

                        {/* Two Manager Summary Boxes */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                            {/* UOB Box */}
                            <div style={{
                                padding: '0.95rem',
                                borderRadius: '10px',
                                background: 'var(--color-bg-elevated)',
                                border: '1px solid var(--color-border)',
                                borderTop: '3px solid #6366f1'
                            }}>
                                <div className="flex-between" style={{ marginBottom: '0.35rem' }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#818cf8' }}>UOB Asset Mgmt</span>
                                    <span className="tabular-nums" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                                        {managerComp.uobSharePct.toFixed(2)}%
                                    </span>
                                </div>
                                <div className="tabular-nums" style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                                    {formatTHB(managerComp.uobTotalValue)}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
                                    <span>Wtd YTD: <strong style={{ color: managerComp.uobWeightedYtdReturn >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                        {managerComp.uobWeightedYtdReturn >= 0 ? '+' : ''}{managerComp.uobWeightedYtdReturn.toFixed(2)}%
                                    </strong></span>
                                    <span>5Y: <strong style={{ color: managerComp.uobWeighted5YReturn >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                        {managerComp.uobWeighted5YReturn >= 0 ? '+' : ''}{managerComp.uobWeighted5YReturn.toFixed(2)}%
                                    </strong></span>
                                </div>
                            </div>

                            {/* TISCO Box */}
                            <div style={{
                                padding: '0.95rem',
                                borderRadius: '10px',
                                background: 'var(--color-bg-elevated)',
                                border: '1px solid var(--color-border)',
                                borderTop: '3px solid #06b6d4'
                            }}>
                                <div className="flex-between" style={{ marginBottom: '0.35rem' }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#22d3ee' }}>TISCO Asset Mgmt</span>
                                    <span className="tabular-nums" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                                        {managerComp.tiscoSharePct.toFixed(2)}%
                                    </span>
                                </div>
                                <div className="tabular-nums" style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                                    {formatTHB(managerComp.tiscoTotalValue)}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
                                    <span>Wtd YTD: <strong style={{ color: managerComp.tiscoWeightedYtdReturn >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                        {managerComp.tiscoWeightedYtdReturn >= 0 ? '+' : ''}{managerComp.tiscoWeightedYtdReturn.toFixed(2)}%
                                    </strong></span>
                                    <span>5Y: <strong style={{ color: managerComp.tiscoWeighted5YReturn >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                        {managerComp.tiscoWeighted5YReturn >= 0 ? '+' : ''}{managerComp.tiscoWeighted5YReturn.toFixed(2)}%
                                    </strong></span>
                                </div>
                            </div>
                        </div>

                        {/* Category Head-to-Head Bars */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {managerComp.categories.map((cat) => {
                                const uobYtd = cat.uobPolicy?.ytdReturn ?? 0;
                                const tisYtd = cat.tiscoPolicy?.ytdReturn ?? 0;
                                const uobVal = cat.uobPolicy?.marketValue ?? 0;
                                const tisVal = cat.tiscoPolicy?.marketValue ?? 0;
                                return (
                                    <div
                                        key={cat.category}
                                        style={{
                                            padding: '0.65rem 0.8rem',
                                            borderRadius: '8px',
                                            background: 'var(--color-bg-elevated)',
                                            border: '1px solid var(--color-border)',
                                            fontSize: '0.78rem'
                                        }}
                                    >
                                        <div className="flex-between" style={{ marginBottom: '0.3rem' }}>
                                            <span style={{ fontWeight: 700 }}>{cat.labelTh}</span>
                                            <span className="tabular-nums" style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                                Total: {formatTHB(cat.totalCategoryValue)} ({cat.totalCategoryActualPct.toFixed(2)}%)
                                            </span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }} className="tabular-nums">
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: 'var(--color-text-secondary)' }}>UOB ({cat.uobPolicy?.code}):</span>
                                                <span style={{ fontWeight: 700, color: uobYtd >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                                    {uobYtd >= 0 ? '+' : ''}{uobYtd.toFixed(2)}% YTD ({formatTHB(uobVal)})
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: 'var(--color-text-secondary)' }}>TISCO ({cat.tiscoPolicy?.code}):</span>
                                                <span style={{ fontWeight: 700, color: tisYtd >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                                    {tisYtd >= 0 ? '+' : ''}{tisYtd.toFixed(2)}% YTD ({formatTHB(tisVal)})
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Detailed Sub-Fund Position & Rebalancing Table */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <div className="flex-between" style={{ padding: '1.25rem 1.35rem', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Scale size={18} color="var(--color-primary-light)" />
                        <div>
                            <h3 style={{ fontSize: '1.05rem' }}>Sub-Fund Holdings, NAV & Rebalance Drift ({currentRecord.periodLabel})</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                Exact NAV/Unit, Unit Balances, Market Value, and Portfolio Drift vs. Chosen Plan
                            </p>
                        </div>
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Policy Code</th>
                                <th>Asset Class</th>
                                <th>Manager</th>
                                <th style={{ textAlign: 'right' }}>NAV / Unit (฿)</th>
                                <th style={{ textAlign: 'right' }}>No. of Units</th>
                                <th style={{ textAlign: 'right' }}>Market Value (฿)</th>
                                <th style={{ textAlign: 'right' }}>Plan %</th>
                                <th style={{ textAlign: 'right' }}>Actual %</th>
                                <th style={{ textAlign: 'right' }}>Drift / Rebalance</th>
                                <th style={{ textAlign: 'right' }}>YTD Return</th>
                                <th style={{ textAlign: 'right' }}>5Y Return</th>
                            </tr>
                        </thead>
                        <tbody>
                            {positions.map((pos) => (
                                <tr key={pos.code}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ width: '8px', height: '24px', borderRadius: '4px', background: pos.color, display: 'inline-block' }} />
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{pos.code}</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>{pos.nameTh}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            fontSize: '0.73rem',
                                            fontWeight: 600,
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            background: 'var(--color-bg-elevated)',
                                            border: '1px solid var(--color-border)'
                                        }}>
                                            {pos.category}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            padding: '2px 7px',
                                            borderRadius: '999px',
                                            background: pos.manager === 'UOB' ? 'rgba(99, 102, 241, 0.14)' : 'rgba(6, 182, 212, 0.14)',
                                            color: pos.manager === 'UOB' ? '#818cf8' : '#22d3ee'
                                        }}>
                                            {pos.manager}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{pos.nav.toFixed(4)}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        {pos.units.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatTHB(pos.marketValue)}</td>
                                    <td style={{ textAlign: 'right', color: 'var(--color-text-secondary)' }}>{pos.planAllocation.toFixed(2)}%</td>
                                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{pos.actualPortion.toFixed(2)}%</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <span style={{
                                            color: Math.abs(pos.driftPct) < 0.25 ? 'var(--color-text-muted)' : pos.driftPct > 0 ? '#f59e0b' : '#38bdf8',
                                            fontWeight: 600,
                                            fontSize: '0.78rem'
                                        }}>
                                            {pos.driftPct > 0 ? '+' : ''}{pos.driftPct.toFixed(2)}% ({pos.rebalanceAmount >= 0 ? 'Buy +' : 'Trim '}{formatTHB(pos.rebalanceAmount)})
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <span style={{
                                            color: pos.ytdReturn >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                                            fontWeight: 700
                                        }}>
                                            {pos.ytdReturn >= 0 ? '+' : ''}{pos.ytdReturn.toFixed(2)}%
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        {pos.accReturn5Y !== null && pos.accReturn5Y !== undefined ? (
                                            <span style={{
                                                color: pos.accReturn5Y >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                                                fontWeight: 700
                                            }}>
                                                {pos.accReturn5Y >= 0 ? '+' : ''}{pos.accReturn5Y.toFixed(2)}%
                                            </span>
                                        ) : (
                                            <span style={{ color: 'var(--color-text-muted)' }}>N/A</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Section 3: Historical Sub-Fund NAV Trajectory (2020 Q1 – 2026 Q3) */}
            <div className="card" style={{ padding: '1.35rem' }}>
                <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={18} color="var(--color-primary-light)" />
                        <div>
                            <h3 style={{ fontSize: '1.05rem' }}>Sub-Fund NAV Trajectory (2020 Q1 – 2026 Q3)</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                {navMode === 'indexed'
                                    ? 'Normalized to Base 100 at inception to compare cumulative unit value growth across all 6 sub-funds'
                                    : 'Actual Net Asset Value (Baht per Unit) reported on each quarterly statement'}
                            </p>
                        </div>
                    </div>
                    <div className="pill-toggle-group">
                        <button
                            className={`pill-toggle-btn ${navMode === 'indexed' ? 'active' : ''}`}
                            onClick={() => setNavMode('indexed')}
                        >
                            Indexed (Base 100)
                        </button>
                        <button
                            className={`pill-toggle-btn ${navMode === 'raw' ? 'active' : ''}`}
                            onClick={() => setNavMode('raw')}
                        >
                            Actual NAV (฿)
                        </button>
                    </div>
                </div>

                <div style={{ height: '340px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={navHistoryData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                            <XAxis
                                dataKey="shortPeriod"
                                tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                domain={['auto', 'auto']}
                                tickFormatter={(v) => (navMode === 'indexed' ? `${v}` : `฿${v}`)}
                                tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '8px',
                                    color: 'var(--color-text-main)',
                                    fontSize: '0.8rem'
                                }}
                                formatter={(val: any, name: any) => [
                                    navMode === 'indexed' ? `${Number(val).toFixed(2)} pts` : `฿${Number(val).toFixed(4)}`,
                                    `${name} (${POLICY_METADATA[name]?.shortName || name})`
                                ]}
                            />
                            <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: '8px' }} />
                            <Line type="monotone" dataKey="AERO1-UOB" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="AERO1-TIS" stroke="#38bdf8" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                            <Line type="monotone" dataKey="AERO2-UOB" stroke="#8b5cf6" strokeWidth={2.5} dot={false} />
                            <Line type="monotone" dataKey="AERO2-TIS" stroke="#c084fc" strokeWidth={2.5} strokeDasharray="4 4" dot={false} />
                            <Line type="monotone" dataKey="AERO3-UOB" stroke="#10b981" strokeWidth={2.5} dot={false} connectNulls />
                            <Line type="monotone" dataKey="AERO3-TIS" stroke="#34d399" strokeWidth={2.5} strokeDasharray="4 4" dot={false} connectNulls />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Section 4: Historical Asset Class Evolution (Stacked 100% Area Chart) */}
            <div className="card" style={{ padding: '1.35rem' }}>
                <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Layers size={18} color="#10b981" />
                        <div>
                            <h3 style={{ fontSize: '1.05rem' }}>Strategic Asset Allocation Evolution (2020 Q1 – 2026 Q3)</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                Transition from Plan 7 (40% Fixed / 60% Mixed) to DIY High-Growth (30% Fixed / 20% Mixed / 50% Foreign Equity)
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={records} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                            <XAxis
                                dataKey="shortPeriodLabel"
                                tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tickFormatter={(v) => `${v}%`}
                                tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '8px',
                                    color: 'var(--color-text-main)',
                                    fontSize: '0.8rem'
                                }}
                                formatter={(val: any, name: any) => [`${Number(val).toFixed(2)}%`, name]}
                            />
                            <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: '8px' }} />
                            <Area
                                type="monotone"
                                dataKey="fixedIncomeActualPct"
                                name="Fixed Income (ตราสารหนี้ AERO1)"
                                stackId="1"
                                stroke="#0ea5e9"
                                fill="#0ea5e9"
                                fillOpacity={0.75}
                            />
                            <Area
                                type="monotone"
                                dataKey="mixedActualPct"
                                name="Mixed (ผสม AERO2)"
                                stackId="1"
                                stroke="#8b5cf6"
                                fill="#8b5cf6"
                                fillOpacity={0.75}
                            />
                            <Area
                                type="monotone"
                                dataKey="foreignEquityActualPct"
                                name="Foreign Equity (ตราสารทุนต่างประเทศ AERO3)"
                                stackId="1"
                                stroke="#10b981"
                                fill="#10b981"
                                fillOpacity={0.8}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default PolicyAnalyticsView;
