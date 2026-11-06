import React, { useState } from 'react';
import { X, Trash2, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import type { PVDRecord, PVDPolicy } from '../types';
import { POLICY_METADATA } from '../utils/mockData';

interface DataEntryFormProps {
    onClose: () => void;
    onSubmit: (record: PVDRecord) => void;
    onDelete?: (id: string) => void;
    initialData?: PVDRecord;
    templateRecord?: PVDRecord;
}

const DEFAULT_POLICIES: PVDPolicy[] = [
    {
        code: 'AERO1-UOB',
        nameTh: POLICY_METADATA['AERO1-UOB'].nameTh,
        manager: 'UOB',
        category: 'Fixed Income',
        planAllocation: 10,
        actualPortion: 10,
        nav: 13.7,
        units: 0,
        ytdReturn: 0,
        accReturn5Y: null
    },
    {
        code: 'AERO1-TIS',
        nameTh: POLICY_METADATA['AERO1-TIS'].nameTh,
        manager: 'TISCO',
        category: 'Fixed Income',
        planAllocation: 10,
        actualPortion: 10,
        nav: 13.8,
        units: 0,
        ytdReturn: 0,
        accReturn5Y: null
    },
    {
        code: 'AERO2-UOB',
        nameTh: POLICY_METADATA['AERO2-UOB'].nameTh,
        manager: 'UOB',
        category: 'Mixed',
        planAllocation: 25,
        actualPortion: 25,
        nav: 11.1,
        units: 0,
        ytdReturn: 0,
        accReturn5Y: null
    },
    {
        code: 'AERO2-TIS',
        nameTh: POLICY_METADATA['AERO2-TIS'].nameTh,
        manager: 'TISCO',
        category: 'Mixed',
        planAllocation: 25,
        actualPortion: 25,
        nav: 11.4,
        units: 0,
        ytdReturn: 0,
        accReturn5Y: null
    },
    {
        code: 'AERO3-UOB',
        nameTh: POLICY_METADATA['AERO3-UOB'].nameTh,
        manager: 'UOB',
        category: 'Foreign Equity',
        planAllocation: 15,
        actualPortion: 15,
        nav: 15.8,
        units: 0,
        ytdReturn: 0,
        accReturn5Y: null
    },
    {
        code: 'AERO3-TIS',
        nameTh: POLICY_METADATA['AERO3-TIS'].nameTh,
        manager: 'TISCO',
        category: 'Foreign Equity',
        planAllocation: 15,
        actualPortion: 15,
        nav: 16.5,
        units: 0,
        ytdReturn: 0,
        accReturn5Y: null
    }
];

function toInputDate(dateStr?: string): string {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
    }
    return dateStr;
}

function toStatementDDMMYYYY(dateStr: string): string {
    if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
    }
    return dateStr;
}

const DataEntryForm: React.FC<DataEntryFormProps> = ({
    onClose,
    onSubmit,
    onDelete,
    initialData,
    templateRecord
}) => {
    const nextQuarter = templateRecord
        ? (templateRecord.quarter === 4 ? 1 : templateRecord.quarter + 1)
        : 4;
    const nextYear = templateRecord
        ? (templateRecord.quarter === 4 ? templateRecord.year + 1 : templateRecord.year)
        : 2026;

    const [quarter, setQuarter] = useState<number>(initialData?.quarter ?? nextQuarter);
    const [year, setYear] = useState<number>(initialData?.year ?? nextYear);
    const [dateInput, setDateInput] = useState<string>(toInputDate(initialData?.statementDate));
    const [documentNo, setDocumentNo] = useState<string>(initialData?.documentNo || 'AERO/00164');
    const [returnRate, setReturnRate] = useState<number>(initialData?.returnRate ?? 0);

    const [memberContribution, setMemberContribution] = useState<number>(
        initialData?.memberContribution ?? templateRecord?.memberContribution ?? 0
    );
    const [memberEarnings, setMemberEarnings] = useState<number>(
        initialData?.memberEarnings ?? templateRecord?.memberEarnings ?? 0
    );
    const [employerContribution, setEmployerContribution] = useState<number>(
        initialData?.employerContribution ?? templateRecord?.employerContribution ?? 0
    );
    const [employerEarnings, setEmployerEarnings] = useState<number>(
        initialData?.employerEarnings ?? templateRecord?.employerEarnings ?? 0
    );

    const [ytdMemContrib, setYtdMemContrib] = useState<number>(
        initialData?.ytd?.memberContribution ?? 0
    );
    const [ytdMemEarn, setYtdMemEarn] = useState<number>(
        initialData?.ytd?.memberEarnings ?? 0
    );
    const [ytdEmpContrib, setYtdEmpContrib] = useState<number>(
        initialData?.ytd?.employerContribution ?? 0
    );
    const [ytdEmpEarn, setYtdEmpEarn] = useState<number>(
        initialData?.ytd?.employerEarnings ?? 0
    );

    const [policies, setPolicies] = useState<PVDPolicy[]>(() => {
        if (initialData?.policies && initialData.policies.length > 0) {
            return initialData.policies.map(p => ({ ...p }));
        }
        if (templateRecord?.policies && templateRecord.policies.length > 0) {
            return templateRecord.policies.map(p => ({ ...p }));
        }
        return DEFAULT_POLICIES.map(p => ({ ...p }));
    });

    const [showPoliciesSection, setShowPoliciesSection] = useState<boolean>(false);

    const totalMemberPortion = Number((memberContribution + memberEarnings).toFixed(2));
    const totalEmployerPortion = Number((employerContribution + employerEarnings).toFixed(2));
    const totalBalance = Number((totalMemberPortion + totalEmployerPortion).toFixed(2));

    const handlePolicyChange = (idx: number, field: keyof PVDPolicy, val: number) => {
        setPolicies(prev => {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], [field]: val };
            return copy;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const statementDate = toStatementDDMMYYYY(dateInput);
        const [dd, mm, yyyy] = statementDate.split('/');
        const thaiYear = year + 543;
        const statementDateThai = dd && mm && yyyy ? `${dd}/${mm}/${thaiYear}` : undefined;

        const ytdMemPortion = Number((ytdMemContrib + ytdMemEarn).toFixed(2));
        const ytdEmpPortion = Number((ytdEmpContrib + ytdEmpEarn).toFixed(2));
        const ytdTotal = Number((ytdMemPortion + ytdEmpPortion).toFixed(2));

        const newRecord: PVDRecord = {
            ...initialData,
            id: initialData?.id || `${year}-Q${quarter}`,
            statementDate,
            statementDateThai,
            quarter,
            year,
            thaiYear,
            documentNo,
            planCode: initialData?.planCode || 'DIY',
            planName: initialData?.planName || 'แผนกำหนดสัดส่วนการลงทุนด้วยตนเอง',
            memberContribution,
            memberEarnings,
            employerContribution,
            employerEarnings,
            totalMemberPortion,
            totalEmployerPortion,
            totalBalance,
            returnRate,
            ytd: {
                memberContribution: ytdMemContrib,
                memberEarnings: ytdMemEarn,
                employerContribution: ytdEmpContrib,
                employerEarnings: ytdEmpEarn,
                total: ytdTotal
            },
            policies
        };

        onSubmit(newRecord);
    };

    const handleDelete = () => {
        if (initialData?.id && onDelete) {
            if (window.confirm(`Delete statement ${initialData.id}? This will also remove it from Firebase Cloud.`)) {
                onDelete(initialData.id);
            }
        }
    };

    const inputStyle: React.CSSProperties = {
        padding: '0.5rem 0.65rem',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text-main)',
        fontSize: '0.85rem',
        width: '100%'
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(2, 6, 23, 0.72)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '1rem'
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '720px',
                padding: '1.5rem',
                maxHeight: '90vh',
                overflowY: 'auto',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)'
            }}>
                <div className="flex-between" style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
                    <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                            {initialData ? `Edit Statement: Q${initialData.quarter}/${initialData.year}` : 'Add Quarterly PVD Statement'}
                        </h3>
                        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                            Changes automatically sync to Firebase Cloud Firestore & all connected devices
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'var(--color-bg-subtle)',
                            color: 'var(--color-text-secondary)',
                            padding: '0.4rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--color-border)'
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    {/* Period & Header Metadata */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                                Quarter (1–4)
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={4}
                                value={quarter}
                                onChange={(e) => setQuarter(Number(e.target.value))}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                                Year (A.D.)
                            </label>
                            <input
                                type="number"
                                min={2015}
                                max={2050}
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                                Statement Date
                            </label>
                            <input
                                type="date"
                                value={dateInput}
                                onChange={(e) => setDateInput(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                                YTD i-Return (%)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={returnRate}
                                onChange={(e) => setReturnRate( parseFloat(e.target.value) || 0 )}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                                Document No.
                            </label>
                            <input
                                type="text"
                                value={documentNo}
                                onChange={(e) => setDocumentNo(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Ending Balances */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                        <div style={{ padding: '1rem', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                            <div className="flex-between" style={{ marginBottom: '0.65rem' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#06b6d4' }}>Ending Member Portion</span>
                                <span className="tabular-nums" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                                    ฿{totalMemberPortion.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>Contribution (สะสม)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={memberContribution}
                                        onChange={(e) => setMemberContribution(parseFloat(e.target.value) || 0)}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>Earnings (ผลประโยชน์)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={memberEarnings}
                                        onChange={(e) => setMemberEarnings(parseFloat(e.target.value) || 0)}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '1rem', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                            <div className="flex-between" style={{ marginBottom: '0.65rem' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3b82f6' }}>Ending AEROTHAI Portion</span>
                                <span className="tabular-nums" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                                    ฿{totalEmployerPortion.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>Contribution (สมทบ)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={employerContribution}
                                        onChange={(e) => setEmployerContribution(parseFloat(e.target.value) || 0)}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>Earnings (ผลประโยชน์)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={employerEarnings}
                                        onChange={(e) => setEmployerEarnings(parseFloat(e.target.value) || 0)}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* YTD Row */}
                    <div style={{ padding: '1rem', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                        <div className="flex-between" style={{ marginBottom: '0.65rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                                Current Year-to-Date (YTD) Movement Row (รายการระหว่างปีปัจจุบัน)
                            </span>
                            <span className="badge badge-primary tabular-nums">
                                Ending Total: ฿{totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '0.75rem' }}>
                            <div>
                                <label style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>YTD Member Contrib</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={ytdMemContrib}
                                    onChange={(e) => setYtdMemContrib(parseFloat(e.target.value) || 0)}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>YTD Member Earnings</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={ytdMemEarn}
                                    onChange={(e) => setYtdMemEarn(parseFloat(e.target.value) || 0)}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>YTD AEROTHAI Contrib</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={ytdEmpContrib}
                                    onChange={(e) => setYtdEmpContrib(parseFloat(e.target.value) || 0)}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>YTD AEROTHAI Earnings</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={ytdEmpEarn}
                                    onChange={(e) => setYtdEmpEarn(parseFloat(e.target.value) || 0)}
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Expandable 6 Sub-Fund Policy Details */}
                    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                        <button
                            type="button"
                            onClick={() => setShowPoliciesSection(!showPoliciesSection)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                background: 'var(--color-bg-subtle)',
                                color: 'var(--color-text-main)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                border: 'none',
                                fontSize: '0.82rem',
                                fontWeight: 700
                            }}
                        >
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Layers size={15} color="var(--color-primary)" />
                                6 Sub-Fund Policies Breakdown (UOBAM & TISCO NAV / Units / Returns)
                            </span>
                            {showPoliciesSection ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {showPoliciesSection && (
                            <div style={{ padding: '0.85rem', overflowX: 'auto' }}>
                                <table className="data-table" style={{ fontSize: '0.76rem' }}>
                                    <thead>
                                        <tr>
                                            <th>Policy Code</th>
                                            <th className="num">Plan %</th>
                                            <th className="num">Actual %</th>
                                            <th className="num">NAV (4 dec)</th>
                                            <th className="num">Units (4 dec)</th>
                                            <th className="num">YTD Return %</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {policies.map((pol, idx) => (
                                            <tr key={pol.code}>
                                                <td style={{ fontWeight: 700 }}>{pol.code}</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={pol.planAllocation}
                                                        onChange={(e) => handlePolicyChange(idx, 'planAllocation', parseFloat(e.target.value) || 0)}
                                                        style={{ ...inputStyle, padding: '0.3rem 0.45rem' }}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={pol.actualPortion}
                                                        onChange={(e) => handlePolicyChange(idx, 'actualPortion', parseFloat(e.target.value) || 0)}
                                                        style={{ ...inputStyle, padding: '0.3rem 0.45rem' }}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        step="0.0001"
                                                        value={pol.nav}
                                                        onChange={(e) => handlePolicyChange(idx, 'nav', parseFloat(e.target.value) || 0)}
                                                        style={{ ...inputStyle, padding: '0.3rem 0.45rem' }}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        step="0.0001"
                                                        value={pol.units}
                                                        onChange={(e) => handlePolicyChange(idx, 'units', parseFloat(e.target.value) || 0)}
                                                        style={{ ...inputStyle, padding: '0.3rem 0.45rem' }}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={pol.ytdReturn}
                                                        onChange={(e) => handlePolicyChange(idx, 'ytdReturn', parseFloat(e.target.value) || 0)}
                                                        style={{ ...inputStyle, padding: '0.3rem 0.45rem' }}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Footer Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                        {initialData && onDelete ? (
                            <button
                                type="button"
                                onClick={handleDelete}
                                style={{
                                    padding: '0.6rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    backgroundColor: 'var(--color-danger-bg)',
                                    color: 'var(--color-danger)',
                                    border: '1px solid var(--color-danger)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    fontSize: '0.82rem',
                                    fontWeight: 600
                                }}
                            >
                                <Trash2 size={15} />
                                Delete Statement
                            </button>
                        ) : <div />}

                        <div style={{ display: 'flex', gap: '0.65rem' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    padding: '0.6rem 1.1rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--color-bg-subtle)',
                                    color: 'var(--color-text-secondary)',
                                    border: '1px solid var(--color-border)',
                                    fontSize: '0.82rem',
                                    fontWeight: 600
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                style={{
                                    padding: '0.6rem 1.35rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--color-primary)',
                                    color: '#fff',
                                    fontSize: '0.85rem',
                                    fontWeight: 700
                                }}
                            >
                                Save & Sync to Cloud
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DataEntryForm;
