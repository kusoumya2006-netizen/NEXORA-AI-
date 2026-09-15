import React from 'react';
import {
  LayoutDashboard,
  Radio,
  Search,
  ShieldAlert,
  BarChart3,
  FileText,
  Lock,
  Activity
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'live', label: 'Live Call Analysis', icon: Radio, badge: 'REALTIME' },
    { id: 'investigation', label: 'Call Investigation', icon: Search },
    { id: 'alerts', label: 'Threat & Alert Center', icon: ShieldAlert },
    { id: 'analytics', label: 'Risk Analytics', icon: BarChart3 },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
    { id: 'security', label: 'Security Response', icon: Lock },
    { id: 'status', label: 'System & Model Status', icon: Activity },
  ];

  return (
    <aside className="w-64 bg-[#0a0e1a] border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div className="px-3">
          <p className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
            SOC Navigation
          </p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-soc-cyan/15 text-soc-cyan border border-soc-cyan/30 shadow-[0_0_10px_rgba(6,182,212,0.15)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-soc-cyan' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.2 rounded font-mono font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Team Ownership Info Box */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3 text-[11px] space-y-2 font-mono">
        <div className="flex items-center justify-between text-slate-400">
          <span>TEAM MODULES</span>
          <span className="text-emerald-400 font-bold">6 / 6 INTEGRATED</span>
        </div>
        <div className="space-y-1 text-[10px] text-slate-500">
          <p>M1: Backend + Orchestrator</p>
          <p>M2: Voice Clone Detector</p>
          <p>M3: Speaker + Acoustics</p>
          <p>M4: Intent + Risk Engine</p>
          <p>M5: SOC Dashboard UI</p>
          <p>M6: Security & Audit Logs</p>
        </div>
      </div>
    </aside>
  );
}
