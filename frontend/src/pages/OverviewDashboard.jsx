import React from 'react';
import { Phone, ShieldAlert, AlertTriangle, Activity, Lock, UserX, ArrowUpRight } from 'lucide-react';
import ThreatBadge from '../components/ThreatBadge';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

export default function OverviewDashboard({ summary, calls, onSelectCall, onNavigate }) {
  if (!summary) return <div className="p-8 text-center text-slate-400 font-mono">Loading SOC Dashboard metrics...</div>;

  const kpis = [
    { label: 'Total Calls Analyzed', value: summary.total_calls, icon: Phone, color: 'text-soc-cyan', bg: 'bg-soc-cyan/10 border-soc-cyan/20' },
    { label: 'Suspicious Calls', value: summary.suspicious_calls, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/40' },
    { label: 'Critical Threats', value: summary.critical_threats, icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-950/50 border-red-800/50' },
    { label: 'Average Risk Score', value: `${summary.average_risk} / 100`, icon: Activity, color: summary.average_risk > 50 ? 'text-red-400' : 'text-emerald-400', bg: 'bg-slate-900 border-slate-800' },
    { label: 'Blocked Sessions', value: summary.blocked_sessions, icon: Lock, color: 'text-red-400', bg: 'bg-red-950/30 border-red-900/40' },
    { label: 'Biometric Failures', value: summary.verification_failures, icon: UserX, color: 'text-orange-400', bg: 'bg-orange-950/30 border-orange-900/40' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-5 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide font-mono flex items-center gap-3">
            CYBERSECURITY COMMAND CENTER
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time automated detection, speaker verification & threat prevention active across all voice channels.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onNavigate('live')}
            className="px-4 py-2 bg-gradient-to-r from-soc-cyan to-blue-600 hover:from-soc-cyanLight hover:to-blue-500 text-slate-950 font-bold text-xs rounded-lg shadow-[0_0_12px_rgba(6,182,212,0.3)] transition flex items-center gap-2 font-mono"
          >
            LAUNCH LIVE ANALYZER
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className={`p-4 rounded-xl border ${kpi.bg} flex flex-col justify-between`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">{kpi.label}</span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className={`text-2xl font-bold font-mono mt-3 ${kpi.color}`}>{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Breakdown */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-200 font-mono mb-4">THREAT LEVEL DISTRIBUTION</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.risk_distribution || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {(summary.risk_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {(summary.risk_distribution || []).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span>{item.name}: <strong className="font-mono text-white">{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Analyzed Calls Table */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200 font-mono">RECENT INTERCEPTED VOICE SESSIONS</h3>
            <button
              onClick={() => onNavigate('investigation')}
              className="text-xs text-soc-cyan hover:underline font-mono"
            >
              View All Calls →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] text-slate-400 font-mono uppercase border-b border-slate-800">
                <tr>
                  <th className="pb-2">Call ID</th>
                  <th className="pb-2">Caller Claim</th>
                  <th className="pb-2">Risk Score</th>
                  <th className="pb-2">Threat Level</th>
                  <th className="pb-2">Security Action</th>
                  <th className="pb-2 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {(calls || []).slice(0, 4).map((call) => (
                  <tr key={call.id} className="hover:bg-slate-800/30">
                    <td className="py-3 font-bold text-slate-200">{call.id}</td>
                    <td className="py-3 text-slate-300">{call.caller_claimed_identity || 'Unknown'}</td>
                    <td className="py-3">
                      <span className={`font-bold ${call.risk_score >= 75 ? 'text-red-400' : call.risk_score >= 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {call.risk_score}/100
                      </span>
                    </td>
                    <td className="py-3">
                      <ThreatBadge level={call.risk_level} />
                    </td>
                    <td className="py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${
                        call.hold_transaction ? 'bg-red-950/70 text-red-400 border-red-800' : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {call.action_type || 'ALLOW'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onSelectCall(call.id)}
                        className="px-2.5 py-1 bg-soc-cyan/20 text-soc-cyan hover:bg-soc-cyan hover:text-black rounded text-[11px] font-bold transition"
                      >
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
