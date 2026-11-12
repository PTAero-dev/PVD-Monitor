import React from 'react';
import {
    LayoutDashboard,
    PieChart,
    FileText,
    Calculator,
    Table2,
    Sun,
    Moon,
    Cloud,
    CloudOff,
    RefreshCw,
    Plane
} from 'lucide-react';
import { useTheme } from './ThemeContext';

export type NavTab = 'overview' | 'policies' | 'statement' | 'simulator' | 'ledger';

interface LayoutProps {
    children: React.ReactNode;
    activeTab: NavTab;
    onTabChange: (tab: NavTab) => void;
    syncStatus: 'synced' | 'syncing' | 'offline';
    onManualSync?: () => void;
    latestPeriodLabel?: string;
}

const NAV_ITEMS: { id: NavTab; label: string; shortLabel: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', shortLabel: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'policies', label: 'Policies & NAV', shortLabel: 'Policies', icon: <PieChart size={18} /> },
    { id: 'statement', label: 'Statement View', shortLabel: 'Statement', icon: <FileText size={18} /> },
    { id: 'simulator', label: 'Wealth Simulator', shortLabel: 'Simulator', icon: <Calculator size={18} /> },
    { id: 'ledger', label: 'Ledger & Data', shortLabel: 'Ledger', icon: <Table2 size={18} /> },
];

const Layout: React.FC<LayoutProps> = ({
    children,
    activeTab,
    onTabChange,
    syncStatus,
    onManualSync,
    latestPeriodLabel = 'Q3/2026'
}) => {
    const { theme, toggleTheme } = useTheme();

    const syncBadgeColor =
        syncStatus === 'synced' ? '#10b981' : syncStatus === 'syncing' ? '#f59e0b' : '#94a3b8';

    return (
        <div className="layout-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Sticky Glass Header */}
            <header style={{
                background: 'var(--color-header-bg)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                position: 'sticky',
                top: 0,
                zIndex: 80,
                borderBottom: '1px solid var(--color-border)'
            }}>
                <div className="container" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: '4.25rem',
                    gap: '0.75rem',
                    paddingTop: '0.4rem',
                    paddingBottom: '0.4rem'
                }}>
                    {/* Brand & Member Identity */}
                    <div
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                        onClick={() => onTabChange('overview')}
                    >
                        <div style={{
                            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                            borderRadius: '11px',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
                            flexShrink: 0
                        }}>
                            <Plane size={21} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <h1 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                                    AEROTHAI PVD
                                </h1>
                                <span style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    padding: '2px 7px',
                                    borderRadius: '999px',
                                    background: 'var(--color-primary-soft)',
                                    color: 'var(--color-primary-light)',
                                    border: '1px solid rgba(99, 102, 241, 0.25)'
                                }}>
                                    {latestPeriodLabel}
                                </span>
                            </div>
                            <p style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                                Portfolio & Wealth Intelligence
                            </p>
                        </div>
                    </div>

                    {/* Desktop Tab Navigation */}
                    <nav className="desktop-tabs">
                        {NAV_ITEMS.map((item) => {
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onTabChange(item.id)}
                                    style={{
                                        background: isActive ? 'var(--color-primary-soft)' : 'transparent',
                                        color: isActive ? 'var(--color-primary-light)' : 'var(--color-text-secondary)',
                                        border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                                        padding: '0.45rem 0.85rem',
                                        borderRadius: '8px',
                                        fontSize: '0.82rem',
                                        fontWeight: isActive ? 700 : 500,
                                    }}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Right Controls: Cloud Sync Status + Theme Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                            onClick={onManualSync}
                            title={
                                syncStatus === 'synced'
                                    ? 'Live synced with Firebase Cloud Firestore (pvd-monitor-aero). Click to refresh.'
                                    : syncStatus === 'syncing'
                                    ? 'Syncing with Firebase Cloud Firestore...'
                                    : 'Using local storage cache. Click to retry Firebase Cloud sync.'
                            }
                            style={{
                                background: 'var(--color-bg-elevated)',
                                color: 'var(--color-text-secondary)',
                                border: '1px solid var(--color-border)',
                                padding: '0.38rem 0.7rem',
                                borderRadius: '999px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem'
                            }}
                        >
                            <span
                                className={syncStatus === 'synced' ? 'sync-dot-active' : ''}
                                style={{
                                    width: '7px',
                                    height: '7px',
                                    borderRadius: '50%',
                                    backgroundColor: syncBadgeColor,
                                    display: 'inline-block'
                                }}
                            />
                            {syncStatus === 'synced' && <Cloud size={13} color={syncBadgeColor} />}
                            {syncStatus === 'syncing' && <RefreshCw size={13} color={syncBadgeColor} />}
                            {syncStatus === 'offline' && <CloudOff size={13} color={syncBadgeColor} />}
                            <span style={{ display: 'inline-block' }}>
                                {syncStatus === 'synced' ? 'Firebase Live' : syncStatus === 'syncing' ? 'Syncing...' : 'Local Mode'}
                            </span>
                        </button>

                        <button
                            onClick={toggleTheme}
                            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                            style={{
                                background: 'var(--color-bg-elevated)',
                                color: 'var(--color-text-main)',
                                border: '1px solid var(--color-border)',
                                padding: '0.45rem',
                                borderRadius: '8px',
                                width: '36px',
                                height: '36px'
                            }}
                        >
                            {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container main-content-area">
                {children}
            </main>

            {/* Mobile & Portrait Tablet Fixed Bottom Bar */}
            <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
                {NAV_ITEMS.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            style={{
                                background: 'transparent',
                                color: isActive ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
                                border: 'none',
                                padding: '0.35rem 0.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '2px',
                                fontSize: '0.68rem',
                                fontWeight: isActive ? 700 : 500,
                                flex: 1
                            }}
                        >
                            <div style={{
                                padding: '3px 10px',
                                borderRadius: '999px',
                                background: isActive ? 'var(--color-primary-soft)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {item.icon}
                            </div>
                            <span>{item.shortLabel}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Footer */}
            <footer style={{
                borderTop: '1px solid var(--color-border)',
                padding: '1.5rem 0',
                background: 'var(--color-surface)',
                marginTop: 'auto'
            }}>
                <div className="container flex-between" style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
                    <div>
                        <strong>AEROTHAI Provident Fund Monitor</strong> • Reg. No. 34/2535 (Co-managed by UOBAM & TISCO)
                    </div>
                    <div>
                        Synced via Firebase Cloud Firestore • Responsive PC, Tablet & Mobile
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
