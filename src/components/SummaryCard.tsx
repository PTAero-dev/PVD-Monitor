import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SummaryCardProps {
    title: string;
    subtitle?: string;
    value: number;
    subValue?: number;
    subLabel?: string;
    icon?: React.ReactNode;
    accentColor?: string;
    trend?: number;
    isCurrency?: boolean;
    suffix?: string;
    qoq?: number;
    yoy?: number | null;
    footerNote?: string;
    progressPct?: number;
}

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(val);
};

const formatNumber = (val: number) => {
    return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(val);
};

const SummaryCard: React.FC<SummaryCardProps> = ({
    title,
    subtitle,
    value,
    subValue,
    subLabel,
    icon,
    accentColor = 'var(--color-primary)',
    trend,
    isCurrency = true,
    suffix = '',
    qoq,
    yoy,
    footerNote,
    progressPct
}) => {
    const isPositive = subValue !== undefined ? subValue >= 0 : (trend !== undefined ? trend >= 0 : true);
    const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
    const trendColor = isPositive ? '#10b981' : '#ef4444';
    const trendBg = isPositive ? 'rgba(16, 185, 129, 0.14)' : 'rgba(239, 68, 68, 0.14)';

    return (
        <div
            className="card"
            style={{
                padding: '1.25rem 1.35rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.6rem',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Top accent bar */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: accentColor
            }} />

            <div>
                <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <div>
                        <span style={{
                            color: 'var(--color-text-secondary)',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            display: 'block'
                        }}>
                            {title}
                        </span>
                        {subtitle && (
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>
                                {subtitle}
                            </span>
                        )}
                    </div>
                    {icon && (
                        <div style={{
                            color: accentColor,
                            background: 'var(--color-bg-elevated)',
                            border: '1px solid var(--color-border)',
                            padding: '0.45rem',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {icon}
                        </div>
                    )}
                </div>

                <div
                    className="tabular-nums"
                    style={{
                        fontSize: '1.55rem',
                        fontWeight: 800,
                        color: 'var(--color-text-main)',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2
                    }}
                >
                    {isCurrency ? formatCurrency(value) : `${value > 0 && suffix === '%' ? '+' : ''}${formatNumber(value)}${suffix}`}
                </div>
            </div>

            {(subValue !== undefined || trend !== undefined) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span
                        className="tabular-nums"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '2px 8px',
                            borderRadius: '99px',
                            backgroundColor: trendBg,
                            color: trendColor,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            gap: '3px',
                            border: `1px solid ${trendColor}35`
                        }}
                    >
                        <TrendIcon size={13} />
                        {subValue !== undefined
                            ? `${subValue >= 0 ? '+' : ''}฿${formatNumber(subValue)}`
                            : `${trend && trend >= 0 ? '+' : ''}${trend?.toFixed(2)}%`}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                        {subLabel || (subValue !== undefined ? 'Cumulative Profit' : 'YTD i-Return')}
                    </span>
                </div>
            )}

            {progressPct !== undefined && (
                <div style={{ width: '100%', marginTop: '0.15rem' }}>
                    <div style={{
                        width: '100%',
                        height: '6px',
                        background: 'var(--color-bg-elevated)',
                        borderRadius: '999px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${Math.min(100, Math.max(0, progressPct))}%`,
                            height: '100%',
                            background: accentColor,
                            borderRadius: '999px'
                        }} />
                    </div>
                </div>
            )}

            {(qoq !== undefined || (yoy !== undefined && yoy !== null) || footerNote) && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid var(--color-border)',
                    fontSize: '0.74rem'
                }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {qoq !== undefined && (
                            <div className="tabular-nums">
                                <span style={{ color: 'var(--color-text-muted)', marginRight: '4px' }}>QoQ:</span>
                                <span style={{ color: qoq >= 0 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 700 }}>
                                    {qoq >= 0 ? '+' : ''}{qoq.toFixed(2)}%
                                </span>
                            </div>
                        )}
                        {yoy !== undefined && yoy !== null && (
                            <div className="tabular-nums">
                                <span style={{ color: 'var(--color-text-muted)', marginRight: '4px' }}>YoY:</span>
                                <span style={{ color: yoy >= 0 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 700 }}>
                                    {yoy >= 0 ? '+' : ''}{yoy.toFixed(2)}%
                                </span>
                            </div>
                        )}
                    </div>
                    {footerNote && (
                        <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>
                            {footerNote}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default SummaryCard;
