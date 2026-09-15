import React, { useState, useEffect } from 'react';
import { FileText, Search, ShieldCheck, Cpu } from 'lucide-react';
import { fetchAuditLogs } from '../services/api';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      try {
        const res = await fetchAuditLogs();
        if (res.success && res.data) {
          setLogs(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(l =>
    (l.call_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.event_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.actor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.details || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-3">
            IMMUTABLE SYSTEM AUDIT LOGS
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete cryptographic audit trail recording every analysis execution, risk calculation, threat hold, and security response.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative font-mono text-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#0b0f19] border border-slate-800 text-slate-200 pl-9 pr-4 py-2 rounded-lg text-xs w-64 focus:border-soc-cyan focus:outline-none"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-400 font-mono">Loading audit logs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[10px] text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Event Type</th>
                  <th className="pb-3">Severity</th>
                  <th className="pb-3">Session ID</th>
                  <th className="pb-3">Actor / Subsystem</th>
                  <th className="pb-3">Details</th>
                  <th className="pb-3 text-right">Source IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="py-3 text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="py-3 font-bold text-soc-cyan">{log.event_type}</td>
                    <td className="py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${
                        log.severity === 'CRITICAL'
                          ? 'bg-red-950 text-red-400 border-red-800'
                          : log.severity === 'WARNING'
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-3 text-slate-200 font-bold">{log.call_id || 'N/A'}</td>
                    <td className="py-3 text-slate-300">{log.actor}</td>
                    <td className="py-3 text-slate-300 max-w-xs truncate">{log.details}</td>
                    <td className="py-3 text-right text-slate-500">{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
