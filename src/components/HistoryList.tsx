import React, { useState, useMemo } from 'react';
import {
    Search,
    FileText,
    Edit3,
    Plus,
    FileSpreadsheet,
    Upload,
    FileUp,
    RotateCcw,
    Filter,
    Calendar,
    Layers
} from 'lucide-react';
import type { EnrichedPVDRecord } from '../utils/analytics';
import { computeYearlySummaries } from '../utils/analytics';

interface HistoryListProps {
    data: EnrichedPVDRecord[];
    onEdit?: (record: EnrichedPVDRecord) => void;
    onInspectStatement?: (recordId: string) => void;
    onAddRecord?: () => void;
    onUploadPdfTrigger?: () => void;
    onExportExcel?: () => void;
    onImportExcelTrigger?: () => void;
    onResetToOfficial?: () => void;
    compact?: boolean;
}

const formatTHB = (val: number) =>
    new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(val);

const HistoryList: React.FC<HistoryListProps> = ({
    data,
    onEdit,
    onInspectStatement,
    onAddRecord,
    onUploadPdfTrigger,
    onExportExcel,
    onImportExcelTrigger,
    onResetToOfficial,
    compact = false
}) => {
    const [viewMode, setViewMode] = useState<'quarterly' | 'yearly'>('quarterly');
    const [selectedYear, setSelectedYear] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const availableYears = useMemo(() => {
        const s = new Set<number>();
        data.forEach(r => s.add(r.year));
        return Array.from(s).sort((a, b) => b - a);
    }, [data]);

    const yearlySummaries = useMemo(() => {
        return computeYearlySummaries(data).slice().reverse();
    }, [data]);

    const filteredQuarterly = useMemo(() => {
        const reversed = [...data].reverse();
        return reversed.filter(rec => {
            if (selectedYear !== 'ALL' && String(rec.year) !== selectedYear) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchPeriod = rec.periodLabel.toLowerCase().includes(q);
                const matchDate = rec.statementDate.toLowerCase().includes(q);
                const matchDoc = (rec.documentNo || '').toLowerCase().includes(q);
                const matchPlan = (rec.planName || '').toLowerCase().includes(q);
                return matchPeriod || matchDate || matchDoc || matchPlan;
            }
            return true;
        });
    }, [data, selectedYear, searchQuery]);

    return (
        <div className="card" style={{ overflow: 'hidden' }}>
            {/* Header Bar */}
            <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                            {viewMode === 'quarterly'
                                ? `Complete PVD Statement Ledger (${filteredQuarterly.length} Quarters)`
                                : `Annual PVD Performance Summary (${yearlySummaries.length} Years)`}
                        </h3>
                        <span className="badge badge-primary">2020 Q1 – 2026 Q3</span>
                    </div>
                    {!compact && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                            Click any statement row to inspect the full UOBAM × TISCO 6-policy statement or edit figures
                        </p>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <div className="segmented-control">
                        <button
                            className={`segmented-btn ${viewMode === 'quarterly' ? 'active' : ''}`}
                            onClick={() => setViewMode('quarterly')}
                        >
                            <Layers size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                            Quarterly (27)
                        </button>
                        <button
                            className={`segmented-btn ${viewMode === 'yearly' ? 'active' : ''}`}
                            onClick={() => setViewMode('yearly')}
                        >
                            <Calendar size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                            Annual Summary (7 Yrs)
                        </button>
                    </div>

                    {!compact && onExportExcel && (
                        <button
                            onClick={onExportExcel}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.48rem 0.85rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-surface)',
                                color: 'var(--color-text-main)',
                                fontSize: '0.78rem',
                                fontWeight: 600
                            }}
                        >
                            <FileSpreadsheet size={15} color="#10b981" />
                            Export Excel
                        </button>
                    )}

                    {!compact && onImportExcelTrigger && (
                        <button
                            onClick={onImportExcelTrigger}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.48rem 0.85rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-surface)',
                                color: 'var(--color-text-main)',
                                fontSize: '0.78rem',
                                fontWeight: 600
                            }}
                        >
                            <Upload size={15} color="var(--color-primary)" />
                            Import Excel
                        </button>
                    )}

                    {!compact && onResetToOfficial && (
                        <button
                            onClick={onResetToOfficial}
                            title="Re-sync all 27 verified PDF statements to Firebase Cloud"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.48rem 0.85rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-surface)',
                                color: 'var(--color-text-secondary)',
                                fontSize: '0.78rem',
                                fontWeight: 600
                            }}
                        >
                            <RotateCcw size={14} />
                            Verify / Restore 27 PDFs
                        </button>
                    )}

                    {onUploadPdfTrigger && (
                        <button
                            onClick={onUploadPdfTrigger}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.48rem 0.9rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid rgba(16, 185, 129, 0.4)',
                                background: 'rgba(16, 185, 129, 0.12)',
                                color: 'var(--color-success)',
                                fontSize: '0.78rem',
                                fontWeight: 700
                            }}
                        >
                            <FileUp size={15} />
                            Upload PDF Statement
                        </button>
                    )}

                    {onAddRecord && (
                        <button
                            onClick={onAddRecord}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.48rem 0.95rem',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--color-primary)',
                                color: '#fff',
                                fontSize: '0.8rem',
                                fontWeight: 600
                            }}
                        >
                            <Plus size={15} />
                            Add Quarter
                        </button>
                    )}
                </div>
            </div>

            {/* Filter & Search Bar (for Quarterly mode) */}
            {viewMode === 'quarterly' && !compact && (
                <div style={{
                    padding: '0.85rem 1.5rem',
                    background: 'var(--color-bg-subtle)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <Filter size={14} color="var(--color-text-muted)" />
                        <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginRight: '0.25rem' }}>
                            Filter Year:
                        </span>
                        <button
                            onClick={() => setSelectedYear('ALL')}
                            style={{
                                padding: '0.25rem 0.65rem',
                                borderRadius: '999px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                background: selectedYear === 'ALL' ? 'var(--color-primary)' : 'var(--color-surface)',
                                color: selectedYear === 'ALL' ? '#fff' : 'var(--color-text-secondary)',
                                border: '1px solid var(--color-border)'
                            }}
                        >
                            All (27)
                        </button>
                        {availableYears.map(yr => (
                            <button
                                key={yr}
                                onClick={() => setSelectedYear(String(yr))}
                                style={{
                                    padding: '0.25rem 0.65rem',
                                    borderRadius: '999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    background: selectedYear === String(yr) ? 'var(--color-primary)' : 'var(--color-surface)',
                                    color: selectedYear === String(yr) ? '#fff' : 'var(--color-text-secondary)',
                                    border: '1px solid var(--color-border)'
                                }}
                            >
                                {yr}
                            </button>
                        ))}
                    </div>

                    <div style={{ position: 'relative', minWidth: '220px' }}>
                        <Search
                            size={14}
                            color="var(--color-text-muted)"
                            style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }}
                        />
                        <input
                            type="text"
                            placeholder="Search period, date, doc no..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.38rem 0.75rem 0.38rem 2rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-surface)',
                                color: 'var(--color-text-main)',
                                fontSize: '0.8rem'
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Table Content */}
            <div className="table-scroll" style={{ maxHeight: compact ? '460px' : 'none', overflowY: compact ? 'auto' : 'visible' }}>
                {viewMode === 'quarterly' ? (
                    <table className="data-table">
                        <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                            <tr>
                                <th>Period</th>
                                <th>As of Date</th>
                                <th>Plan / Allocation</th>
                                <th className="num">Member Principal</th>
                                <th className="num">AEROTHAI Principal</th>
                                <th className="num">Cumulative Profit</th>
                                <th className="num">Quarter P/L</th>
                                <th className="num">YTD i-Return</th>
                                <th className="num">Ending Balance</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuarterly.map((rec) => {
                                const isPosProfit = rec.totalEarnings >= 0;
                                const isPosQ = rec.qTotalEarnings >= 0;
                                const isPosReturn = (rec.returnRate || 0) >= 0;
                                return (
                                    <tr key={rec.id}>
                                        <td>
                                            <div style={{ fontWeight: 800, color: 'var(--color-text-main)' }}>
                                                {rec.periodLabel}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                                {rec.documentNo || `B.E. ${rec.thaiYear || rec.year + 543}`}
                                            </div>
                                        </td>
                                        <td className="tabular-nums" style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                                            {rec.statementDate}
                                        </td>
                                        <td>
                                            <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>
                                                FI {rec.fixedIncomePlanPct || 20}% / Mix {rec.mixedPlanPct || 50}% / Eq {rec.foreignEquityPlanPct || 30}%
                                            </span>
                                        </td>
                                        <td className="num">{formatTHB(rec.memberContribution)}</td>
                                        <td className="num">{formatTHB(rec.employerContribution)}</td>
                                        <td
                                            className="num"
                                            style={{
                                                fontWeight: 700,
                                                color: isPosProfit ? 'var(--color-success)' : 'var(--color-danger)'
                                            }}
                                        >
                                            {isPosProfit ? '+' : ''}{formatTHB(rec.totalEarnings)}
                                        </td>
                                        <td className="num">
                                            <div
                                                style={{
                                                    fontWeight: 600,
                                                    color: isPosQ ? 'var(--color-success)' : 'var(--color-danger)'
                                                }}
                                            >
                                                {isPosQ ? '+' : ''}{formatTHB(rec.qTotalEarnings)}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                                ({rec.qInvestmentReturnPct >= 0 ? '+' : ''}{rec.qInvestmentReturnPct.toFixed(2)}% Qtr)
                                            </div>
                                        </td>
                                        <td className="num">
                                            <span className={`badge ${isPosReturn ? 'badge-success' : 'badge-danger'} tabular-nums`}>
                                                {isPosReturn ? '+' : ''}{(rec.returnRate || 0).toFixed(2)}%
                                            </span>
                                        </td>
                                        <td className="num">
                                            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--color-text-main)' }}>
                                                {formatTHB(rec.totalBalance)}
                                            </div>
                                            <div style={{
                                                fontSize: '0.7rem',
                                                color: rec.balanceQoQPct >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                                            }}>
                                                {rec.balanceQoQPct >= 0 ? '+' : ''}{rec.balanceQoQPct.toFixed(2)}% QoQ
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                                                {onInspectStatement && (
                                                    <button
                                                        onClick={() => onInspectStatement(rec.id)}
                                                        title="Inspect Official Statement"
                                                        style={{
                                                            padding: '0.35rem 0.55rem',
                                                            borderRadius: 'var(--radius-sm)',
                                                            border: '1px solid var(--color-border)',
                                                            background: 'var(--color-surface)',
                                                            color: 'var(--color-primary)',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem',
                                                            fontSize: '0.74rem',
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        <FileText size={13} />
                                                        PDF View
                                                    </button>
                                                )}
                                                {onEdit && (
                                                    <button
                                                        onClick={() => onEdit(rec)}
                                                        title="Edit Record"
                                                        style={{
                                                            padding: '0.35rem 0.5rem',
                                                            borderRadius: 'var(--radius-sm)',
                                                            border: '1px solid var(--color-border)',
                                                            background: 'var(--color-surface)',
                                                            color: 'var(--color-text-secondary)',
                                                            display: 'inline-flex',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <Edit3 size={13} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <table className="data-table">
                        <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                            <tr>
                                <th>Year (A.D. / B.E.)</th>
                                <th>Quarters</th>
                                <th className="num">Opening Balance</th>
                                <th className="num">YTD Member Savings</th>
                                <th className="num">YTD AEROTHAI Match</th>
                                <th className="num">YTD Investment Profit/Loss</th>
                                <th className="num">Official i-Return</th>
                                <th className="num">Ending Balance</th>
                                <th className="num">Net Annual Growth</th>
                            </tr>
                        </thead>
                        <tbody>
                            {yearlySummaries.map(ys => {
                                const isPosProfit = ys.totalEarningsYTD >= 0;
                                const isPosIReturn = ys.iReturnPct >= 0;
                                return (
                                    <tr key={ys.year}>
                                        <td style={{ fontWeight: 800 }}>
                                            {ys.year} ({ys.thaiYear})
                                            {ys.quartersCount < 4 && (
                                                <span className="badge badge-primary" style={{ marginLeft: '0.4rem' }}>
                                                    YTD Q{ys.latestQuarter}
                                                </span>
                                            )}
                                        </td>
                                        <td>{ys.quartersCount} Qtrs</td>
                                        <td className="num" style={{ color: 'var(--color-text-secondary)' }}>
                                            {formatTHB(ys.openingBalance)}
                                        </td>
                                        <td className="num">{formatTHB(ys.memberContributionYTD)}</td>
                                        <td className="num">{formatTHB(ys.employerContributionYTD)}</td>
                                        <td
                                            className="num"
                                            style={{
                                                fontWeight: 700,
                                                color: isPosProfit ? 'var(--color-success)' : 'var(--color-danger)'
                                            }}
                                        >
                                            {isPosProfit ? '+' : ''}{formatTHB(ys.totalEarningsYTD)}
                                        </td>
                                        <td className="num">
                                            <span className={`badge ${isPosIReturn ? 'badge-success' : 'badge-danger'} tabular-nums`}>
                                                {isPosIReturn ? '+' : ''}{ys.iReturnPct.toFixed(2)}%
                                            </span>
                                        </td>
                                        <td className="num" style={{ fontWeight: 800, color: 'var(--color-text-main)' }}>
                                            {formatTHB(ys.endingBalance)}
                                        </td>
                                        <td
                                            className="num"
                                            style={{
                                                fontWeight: 700,
                                                color: ys.netBalanceChange >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                                            }}
                                        >
                                            {ys.netBalanceChange >= 0 ? '+' : ''}{formatTHB(ys.netBalanceChange)}
                                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                                ({ys.netBalanceChangePct >= 0 ? '+' : ''}{ys.netBalanceChangePct.toFixed(2)}%)
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default HistoryList;
