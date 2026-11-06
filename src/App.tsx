import { useState } from 'react';
import Layout, { type NavTab } from './components/Layout';
import Dashboard from './components/Dashboard';
import { ThemeProvider } from './components/ThemeContext';

function App() {
    const [activeTab, setActiveTab] = useState<NavTab>('overview');
    const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('syncing');
    const [latestPeriodLabel, setLatestPeriodLabel] = useState<string>('Q3/2026');
    const [manualSyncVersion, setManualSyncVersion] = useState<number>(0);

    return (
        <ThemeProvider>
            <Layout
                activeTab={activeTab}
                onTabChange={setActiveTab}
                syncStatus={syncStatus}
                onManualSync={() => setManualSyncVersion(v => v + 1)}
                latestPeriodLabel={latestPeriodLabel}
            >
                <Dashboard
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onSyncStatusChange={setSyncStatus}
                    onLatestPeriodChange={setLatestPeriodLabel}
                    manualSyncVersion={manualSyncVersion}
                />
            </Layout>
        </ThemeProvider>
    );
}

export default App;
