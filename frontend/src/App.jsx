import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import OverviewDashboard from './pages/OverviewDashboard';
import LiveCallAnalysis from './pages/LiveCallAnalysis';
import CallInvestigation from './pages/CallInvestigation';
import AlertCenter from './pages/AlertCenter';
import RiskAnalytics from './pages/RiskAnalytics';
import AuditLogs from './pages/AuditLogs';
import SecurityResponsePage from './pages/SecurityResponsePage';
import SystemStatus from './pages/SystemStatus';
import { fetchDashboardSummary, fetchCalls, fetchAlerts } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCallId, setSelectedCallId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [calls, setCalls] = useState([]);
  const [activeAlertCount, setActiveAlertCount] = useState(2);

  const loadData = async () => {
    try {
      const sumRes = await fetchDashboardSummary();
      if (sumRes.success) setSummary(sumRes.data);

      const callsRes = await fetchCalls();
      if (callsRes.success) setCalls(callsRes.data);

      const alertsRes = await fetchAlerts(null, 'ACTIVE');
      if (alertsRes.success && alertsRes.data) {
        setActiveAlertCount(alertsRes.data.length);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectCall = (callId) => {
    setSelectedCallId(callId);
    setActiveTab('investigation');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0b0f19] text-slate-100 font-sans">
      <Navbar modelMode="mock" activeAlertCount={activeAlertCount} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-6 overflow-y-auto bg-[#0b0f19]">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'overview' && (
              <OverviewDashboard
                summary={summary}
                calls={calls}
                onSelectCall={handleSelectCall}
                onNavigate={setActiveTab}
              />
            )}
            {activeTab === 'live' && (
              <LiveCallAnalysis onAnalysisComplete={loadData} />
            )}
            {activeTab === 'investigation' && (
              <CallInvestigation
                selectedCallId={selectedCallId}
                onSelectCall={handleSelectCall}
              />
            )}
            {activeTab === 'alerts' && (
              <AlertCenter onSelectCall={handleSelectCall} />
            )}
            {activeTab === 'analytics' && <RiskAnalytics />}
            {activeTab === 'audit' && <AuditLogs />}
            {activeTab === 'security' && <SecurityResponsePage />}
            {activeTab === 'status' && <SystemStatus />}
          </div>
        </main>
      </div>
    </div>
  );
}
