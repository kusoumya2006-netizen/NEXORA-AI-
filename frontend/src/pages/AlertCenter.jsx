import React, { useState, useEffect } from 'react';
import { ShieldAlert, Filter, CheckCircle2, ShieldCheck, Lock, AlertTriangle } from 'lucide-react';
import ThreatBadge from '../components/ThreatBadge';
import { fetchAlerts } from '../services/api';

export default function AlertCenter({ onSelectCall }) {
  const [alerts, setAlerts] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadAlerts() {
      setLoading(true);
      try {
        const sev = severityFilter === 'ALL' ? null : severityFilter;
        const stat = statusFilter === 'ALL' ? null : statusFilter;
        const res = await fetchAlerts(sev, stat);
        if (res.success && res.data) {
          setAlerts(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, [severityFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-3">
            THREAT & ALERT CENTER
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time security alerts emitted by NEXORA Dynamic Risk Engine requiring SOC analyst review or secondary verification.
          </p>
        </div>

        {/* Filter dropdowns */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1.5 bg-[#0b0f19] border border-slate-800 px-3 py-1.5 rounded-lg">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none"
            >
              <option value="ALL">ALL</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#0b0f19] border border-slate-800 px-3 py-1.5 rounded-lg">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none"
            >
              <option value="ALL">ALL</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alert Cards Grid */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 font-mono">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 p-8 text-center text-slate-400 font-mono rounded-xl">
          No security alerts match the selected filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={`p-5 rounded-xl border space-y-4 transition ${
                a.severity === 'CRITICAL'
                  ? 'bg-red-950/40 border-red-800/80'
                  : a.severity === 'HIGH'
                  ? 'bg-orange-950/30 border-orange-800/80'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThreatBadge level={a.severity} />
                  <span className="text-xs font-mono font-bold text-soc-cyan">{a.call_id}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {new Date(a.created_at).toLocaleTimeString()}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-100 font-mono">{a.title}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{a.description}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 font-mono text-xs">
                <span className={`text-[10px] px-2 py-0.5 rounded border ${
                  a.status === 'ACTIVE'
                    ? 'bg-red-950 text-red-400 border-red-800'
                    : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                }`}>
                  STATUS: {a.status}
                </span>

                <button
                  onClick={() => onSelectCall(a.call_id)}
                  className="px-3 py-1.5 bg-soc-cyan/20 text-soc-cyan hover:bg-soc-cyan hover:text-black font-bold rounded text-xs transition"
                >
                  Investigate Threat →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
