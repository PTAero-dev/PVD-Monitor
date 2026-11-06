import React from 'react';
import {
    ChevronLeft,
    ChevronRight,
    FileText,
    Edit3,
    PlusCircle,
    CheckCircle2,
    Building2,
    UserCheck
} from 'lucide-react';
import type { EnrichedPVDRecord } from '../utils/analytics';
import type { MemberProfile } from '../types';

interface StatementInspectorProps {
    records: EnrichedPVDRecord[];
    selectedRecordId: string;
    onSelectRecordId: (id: string) => void;
    memberProfile: MemberProfile;
    onEditRecord: (record: EnrichedPVDRecord) => void;
    onAddRecord: () => void;
}

const fmtNum = (val: number, decimals = 2) =>
    new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(val);

const StatementInspector: React.FC<StatementInspectorProps> = ({
    records,
    selectedRecordId,
    onSelectRecordId,
    memberProfile,
    onEditRecord,
    onAddRecord
}) => {
    const currentIndex = Math.max(
        0,
        records.findIndex(r => r.id === selectedRecordId)
    );
    const rec = records[currentIndex] || records[records.length - 1];

    if (!rec) {
        return <div className="card" style={{ padding: '2rem' }}>No statements found.</div>;
    }

    const prevYear = rec.prevYear || {
        memberContribution: rec.memberContribution - rec.qMemberContrib,
        memberEarnings: rec.memberEarnings - rec.qMemberEarnings,
        employerContribution: rec.employerContribution - rec.qEmployerContrib,
        employerEarnings: rec.employerEarnings - rec.qEmployerEarnings,
        total: rec.totalBalance - rec.qTotalContrib - rec.qTotalEarnings
    };

    const ytd = rec.ytd || {
        memberContribution: rec.qMemberContrib,
        memberEarnings: rec.qMemberEarnings,
        employerContribution: rec.qEmployerContrib,
        employerEarnings: rec.qEmployerEarnings,
        total: rec.qTotalContrib + rec.qTotalEarnings
    };

    const thaiYear = rec.thaiYear || rec.year + 543;
    const dateThai = rec.statementDateThai || `${(rec.statementDateDisplay || '30/09/2026').slice(0, 6)}${thaiYear}`;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Top Navigation Bar */}
            <div className="card" style={{ padding: '1rem 1.35rem' }}>
                <div className="flex-between">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                        <FileText size={20} color="var(--color-primary-light)" />
                        <div>
                            <h2 style={{ fontSize: '1.15rem' }}>
                                Official PVD Statement Inspector — {rec.periodLabel}
                            </h2>
                            <p style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>
                                Digital replica of UOBAM × TISCO Individual Statement of Provident Fund Account (`PVD {rec.year} Q{rec.quarter}.pdf`)
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                            className="btn-secondary"
                            onClick={() => {
                                if (currentIndex > 0) onSelectRecordId(records[currentIndex - 1].id);
                            }}
                            disabled={currentIndex <= 0}
                            style={{ padding: '0.45rem 0.65rem' }}
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <select
                            value={rec.id}
                            onChange={(e) => onSelectRecordId(e.target.value)}
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
                            {records.map((r) => (
                                <option key={r.id} value={r.id}>
                                    PVD {r.year} Q{r.quarter} — {r.statementDateDisplay || r.statementDate}
                                </option>
                            ))}
                        </select>

                        <button
                            className="btn-secondary"
                            onClick={() => {
                                if (currentIndex < records.length - 1) onSelectRecordId(records[currentIndex + 1].id);
                            }}
                            disabled={currentIndex >= records.length - 1}
                            style={{ padding: '0.45rem 0.65rem' }}
                        >
                            <ChevronRight size={16} />
                        </button>

                        <button
                            className="btn-secondary"
                            onClick={() => onEditRecord(rec)}
                            style={{ padding: '0.45rem 0.85rem' }}
                        >
                            <Edit3 size={15} />
                            <span>Edit</span>
                        </button>

                        <button
                            onClick={onAddRecord}
                            style={{ padding: '0.45rem 0.9rem' }}
                        >
                            <PlusCircle size={15} />
                            <span>+ New Statement</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Official Statement Sheet */}
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
                {/* Co-Manager Banner & Statement Title */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    paddingBottom: '1rem',
                    borderBottom: '2px solid var(--color-border)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: '8px',
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#f87171',
                            fontWeight: 800,
                            fontSize: '0.9rem'
                        }}>
                            UOB Asset Management
                        </div>
                        <span style={{ color: 'var(--color-text-muted)', fontWeight: 700 }}>×</span>
                        <div style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: '8px',
                            background: 'rgba(6, 182, 212, 0.12)',
                            border: '1px solid rgba(6, 182, 212, 0.3)',
                            color: '#22d3ee',
                            fontWeight: 800,
                            fontSize: '0.9rem'
                        }}>
                            TISCO Asset Management
                        </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                            รายงานรายสมาชิกกองทุนสำรองเลี้ยงชีพ
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                            Individual Statement of Provident Fund Account
                        </div>
                    </div>
                </div>

                {/* Member & Document Metadata Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    borderRadius: '10px',
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.82rem'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <div>
                            <span style={{ color: 'var(--color-text-muted)' }}>ชื่อกองทุน / Fund Name: </span>
                            <strong style={{ display: 'block' }}>{memberProfile.fundNameTh}</strong>
                        </div>
                        <div>
                            <span style={{ color: 'var(--color-text-muted)' }}>ชื่อนายจ้าง / Employer: </span>
                            <strong>{memberProfile.employerNameTh} (AEROTHAI)</strong>
                        </div>
                        <div>
                            <span style={{ color: 'var(--color-text-muted)' }}>ชื่อสมาชิก / Member's Name: </span>
                            <strong style={{ color: 'var(--color-primary-light)', fontSize: '0.9rem' }}>{memberProfile.memberName}</strong>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }} className="tabular-nums">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>ลำดับเอกสาร / Document No.:</span>
                            <strong>{rec.documentNo || '-'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>สิ้นสุด ณ วันที่ / As of Date:</span>
                            <strong>{dateThai} ({rec.statementDateDisplay || rec.statementDate})</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>ทะเบียนกองทุนเลขที่ / Reg. No.:</span>
                            <strong>{memberProfile.registrationNo}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>รหัสพนักงาน / Employee Code:</span>
                            <strong>{rec.year === 2020 && rec.quarter <= 2 ? '463359' : memberProfile.employeeCode}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>รหัสอ้างอิง / Reference Code:</span>
                            <strong>{memberProfile.referenceCode} • Member: {memberProfile.memberCode}</strong>
                        </div>
                    </div>
                </div>

                {/* Upper Table: Investment Policy Breakdown */}
                {rec.policies && rec.policies.length > 0 && (
                    <div>
                        <div className="flex-between" style={{ marginBottom: '0.6rem' }}>
                            <h3 style={{ fontSize: '0.95rem' }}>
                                ตารางนโยบายการลงทุน / Investment Policy Allocation & Performance
                            </h3>
                            <span style={{
                                fontSize: '0.76rem',
                                color: 'var(--color-text-secondary)',
                                background: 'var(--color-bg-elevated)',
                                padding: '3px 10px',
                                borderRadius: '6px',
                                border: '1px solid var(--color-border)'
                            }}>
                                {rec.planNameTh || rec.planName}
                            </span>
                        </div>

                        <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>ชื่อนโยบาย / Investment Policy</th>
                                        <th style={{ textAlign: 'right' }}>มูลค่าทรัพย์สินสุทธิ/หน่วย<br />NAV/Unit (Baht)</th>
                                        <th style={{ textAlign: 'right' }}>จำนวนหน่วย<br />No. of Units</th>
                                        <th style={{ textAlign: 'right' }}>มูลค่าเงินลงทุน (บาท)<br />Market Value (Baht)</th>
                                        <th style={{ textAlign: 'right' }}>สัดส่วนที่เลือก<br />Plan Alloc (%)</th>
                                        <th style={{ textAlign: 'right' }}>สัดส่วน ณ วันรายงาน<br />Actual Portion (%)</th>
                                        <th style={{ textAlign: 'right' }}>ผลตอบแทนสะสมปี*<br />YTD Return (%)</th>
                                        <th style={{ textAlign: 'right' }}>ผลตอบแทนสะสม 5 ปี**<br />5Y Return (%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rec.policies.map((p) => {
                                        const mktVal = p.nav * p.units;
                                        return (
                                            <tr key={p.code}>
                                                <td style={{ fontWeight: 700 }}>
                                                    {p.nameTh} ({p.code})
                                                </td>
                                                <td style={{ textAlign: 'right' }}>{fmtNum(p.nav, 4)}</td>
                                                <td style={{ textAlign: 'right' }}>{fmtNum(p.units, 4)}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 700 }}>฿{fmtNum(mktVal, 2)}</td>
                                                <td style={{ textAlign: 'right' }}>{fmtNum(p.planAllocation, 2)}%</td>
                                                <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmtNum(p.actualPortion, 2)}%</td>
                                                <td style={{
                                                    textAlign: 'right',
                                                    fontWeight: 700,
                                                    color: p.ytdReturn >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                                                }}>
                                                    {p.ytdReturn >= 0 ? '+' : ''}{fmtNum(p.ytdReturn, 2)}%
                                                </td>
                                                <td style={{
                                                    textAlign: 'right',
                                                    fontWeight: 700,
                                                    color: p.accReturn5Y === null ? 'var(--color-text-muted)' : p.accReturn5Y >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                                                }}>
                                                    {p.accReturn5Y === null || p.accReturn5Y === undefined ? '-' : `${p.accReturn5Y >= 0 ? '+' : ''}${fmtNum(p.accReturn5Y, 2)}%`}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Lower Table: Account Movements (ยอดยกมา / เงินกองทุนระหว่างปี / ยอดยกไป) */}
                <div>
                    <div className="flex-between" style={{ marginBottom: '0.6rem' }}>
                        <h3 style={{ fontSize: '0.95rem' }}>
                            รายละเอียดเงินกองทุน / Member & Employer Account Movements
                        </h3>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.35rem 0.9rem',
                            borderRadius: '8px',
                            background: (rec.returnRate || 0) >= 0 ? 'rgba(16, 185, 129, 0.14)' : 'rgba(239, 68, 68, 0.14)',
                            border: `1px solid ${(rec.returnRate || 0) >= 0 ? '#10b98150' : '#ef444450'}`
                        }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>i-Return (อัตราผลตอบแทนของสมาชิกกองทุน YTD):</span>
                            <span className="tabular-nums" style={{
                                fontSize: '1rem',
                                fontWeight: 800,
                                color: (rec.returnRate || 0) >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                            }}>
                                {(rec.returnRate || 0) >= 0 ? '+' : ''}{fmtNum(rec.returnRate || 0, 2)}%
                            </span>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th rowSpan={2} style={{ verticalAlign: 'middle' }}>รายการ / Descriptions</th>
                                    <th colSpan={2} style={{ textAlign: 'center', borderBottom: '1px solid var(--color-border)', color: '#38bdf8' }}>
                                        ส่วนของสมาชิก / Member's Portion
                                    </th>
                                    <th colSpan={2} style={{ textAlign: 'center', borderBottom: '1px solid var(--color-border)', color: '#818cf8' }}>
                                        ส่วนของนายจ้าง / Employer's Portion (AEROTHAI)
                                    </th>
                                    <th rowSpan={2} style={{ textAlign: 'right', verticalAlign: 'middle' }}>รวม / Total (Baht)</th>
                                </tr>
                                <tr>
                                    <th style={{ textAlign: 'right' }}>เงินสะสม / Contributions</th>
                                    <th style={{ textAlign: 'right' }}>ผลประโยชน์ / Earnings</th>
                                    <th style={{ textAlign: 'right' }}>เงินสมทบ / Contributions</th>
                                    <th style={{ textAlign: 'right' }}>ผลประโยชน์ / Earnings</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <div style={{ fontWeight: 700 }}>ยอดยกมา</div>
                                        <div style={{ fontSize: '0.73rem', color: 'var(--color-text-secondary)' }}>Balance from previous year</div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>{fmtNum(prevYear.memberContribution)}</td>
                                    <td style={{ textAlign: 'right', color: prevYear.memberEarnings >= 0 ? 'inherit' : 'var(--color-danger)' }}>
                                        {fmtNum(prevYear.memberEarnings)}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>{fmtNum(prevYear.employerContribution)}</td>
                                    <td style={{ textAlign: 'right', color: prevYear.employerEarnings >= 0 ? 'inherit' : 'var(--color-danger)' }}>
                                        {fmtNum(prevYear.employerEarnings)}
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmtNum(prevYear.total)}</td>
                                </tr>
                                <tr>
                                    <td>
                                        <div style={{ fontWeight: 700 }}>เงินกองทุนระหว่างปี (YTD)</div>
                                        <div style={{ fontSize: '0.73rem', color: 'var(--color-text-secondary)' }}>Year to date contribute / earnings (01/01/{rec.year} – {rec.statementDateDisplay})</div>
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 600 }}>+{fmtNum(ytd.memberContribution)}</td>
                                    <td style={{
                                        textAlign: 'right',
                                        fontWeight: 600,
                                        color: ytd.memberEarnings >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                                    }}>
                                        {ytd.memberEarnings >= 0 ? '+' : ''}{fmtNum(ytd.memberEarnings)}
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 600 }}>+{fmtNum(ytd.employerContribution)}</td>
                                    <td style={{
                                        textAlign: 'right',
                                        fontWeight: 600,
                                        color: ytd.employerEarnings >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                                    }}>
                                        {ytd.employerEarnings >= 0 ? '+' : ''}{fmtNum(ytd.employerEarnings)}
                                    </td>
                                    <td style={{
                                        textAlign: 'right',
                                        fontWeight: 700,
                                        color: ytd.total >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                                    }}>
                                        {ytd.total >= 0 ? '+' : ''}{fmtNum(ytd.total)}
                                    </td>
                                </tr>
                                {/* Single Quarter Computed Highlight Row */}
                                <tr style={{ background: 'var(--color-bg-elevated)' }}>
                                    <td>
                                        <div style={{ fontWeight: 700, color: 'var(--color-primary-light)' }}>เฉพาะไตรมาสนี้ (Q{rec.quarter}/{rec.year} Isolated)</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>Single-quarter cashflow & investment profit delta</div>
                                    </td>
                                    <td style={{ textAlign: 'right', fontSize: '0.8rem' }}>+{fmtNum(rec.qMemberContrib)}</td>
                                    <td style={{
                                        textAlign: 'right',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        color: rec.qMemberEarnings >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                                    }}>
                                        {rec.qMemberEarnings >= 0 ? '+' : ''}{fmtNum(rec.qMemberEarnings)}
                                    </td>
                                    <td style={{ textAlign: 'right', fontSize: '0.8rem' }}>+{fmtNum(rec.qEmployerContrib)}</td>
                                    <td style={{
                                        textAlign: 'right',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        color: rec.qEmployerEarnings >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                                    }}>
                                        {rec.qEmployerEarnings >= 0 ? '+' : ''}{fmtNum(rec.qEmployerEarnings)}
                                    </td>
                                    <td style={{
                                        textAlign: 'right',
                                        fontSize: '0.82rem',
                                        fontWeight: 700,
                                        color: (rec.qTotalContrib + rec.qTotalEarnings) >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                                    }}>
                                        {(rec.qTotalContrib + rec.qTotalEarnings) >= 0 ? '+' : ''}{fmtNum(rec.qTotalContrib + rec.qTotalEarnings)}
                                    </td>
                                </tr>
                                <tr style={{ borderTop: '2px solid var(--color-border)' }}>
                                    <td>
                                        <div style={{ fontWeight: 800 }}>ยอดยกไป</div>
                                        <div style={{ fontSize: '0.73rem', color: 'var(--color-text-secondary)' }}>Total balance as of this statement</div>
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmtNum(rec.memberContribution)}</td>
                                    <td style={{
                                        textAlign: 'right',
                                        fontWeight: 700,
                                        color: rec.memberEarnings >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                                    }}>
                                        {fmtNum(rec.memberEarnings)}
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmtNum(rec.employerContribution)}</td>
                                    <td style={{
                                        textAlign: 'right',
                                        fontWeight: 700,
                                        color: rec.employerEarnings >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                                    }}>
                                        {fmtNum(rec.employerEarnings)}
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '0.95rem' }}>
                                        ฿{fmtNum(rec.totalBalance)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Summary Portion Footer Cards + Tax Certificate Box */}
                <div className="grid-3col">
                    <div style={{
                        padding: '1rem',
                        borderRadius: '10px',
                        background: 'var(--color-bg-elevated)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                รวมส่วนของสมาชิก / Total Member's Portion
                            </div>
                            <div className="tabular-nums" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                                ฿{fmtNum(rec.totalMemberPortion)}
                            </div>
                        </div>
                        <UserCheck size={24} color="#38bdf8" style={{ opacity: 0.8 }} />
                    </div>

                    <div style={{
                        padding: '1rem',
                        borderRadius: '10px',
                        background: 'var(--color-bg-elevated)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                รวมส่วนของนายจ้าง / Total Employer's Portion
                            </div>
                            <div className="tabular-nums" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#818cf8', marginTop: '2px' }}>
                                ฿{fmtNum(rec.totalEmployerPortion)}
                            </div>
                        </div>
                        <Building2 size={24} color="#818cf8" style={{ opacity: 0.8 }} />
                    </div>

                    <div style={{
                        padding: '1rem',
                        borderRadius: '10px',
                        background: 'var(--color-primary-soft)',
                        border: '1px solid rgba(99, 102, 241, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                เงินสะสมจ่ายเข้ากองทุนปี พ.ศ. {thaiYear} (Tax-Deductible YTD)
                            </div>
                            <div className="tabular-nums" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '2px' }}>
                                ฿{fmtNum(ytd.memberContribution)}
                            </div>
                        </div>
                        <CheckCircle2 size={24} color="var(--color-success)" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatementInspector;
