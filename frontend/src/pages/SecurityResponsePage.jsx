import React, { useState } from 'react';
import { Lock, ShieldCheck, PhoneCall, AlertOctagon, CheckCircle2, Play } from 'lucide-react';
import { triggerSecurityResponse } from '../services/api';

export default function SecurityResponsePage() {
  const [testCallId, setTestCallId] = useState('NX-10482');
  const [simLevel, setSimLevel] = useState('CRITICAL');
  const [responseLog, setResponseLog] = useState(null);
  const [loading, setLoading] = useState(false);

  const policies = [
    {
      level: 'LOW (0–24)',
      action: 'ALLOW',
      color: 'border-emerald-800 bg-emerald-950/20 text-emerald-400',
      description: 'Allow voice call to proceed without interruption. Log passive acoustic telemetry.'
    },
    {
      level: 'MEDIUM (25–49)',
      action: 'WARNING',
      color: 'border-amber-800 bg-amber-950/20 text-amber-400',
      description: 'Display warning alert on SOC console. Flag session for increased acoustic monitoring.'
    },
    {
      level: 'HIGH (50–74)',
      action: 'TRIGGER_SECONDARY_VERIFICATION',
      color: 'border-orange-800 bg-orange-950/20 text-orange-400',
      description: 'Require out-of-band secondary MFA challenge. Queue callback verification.'
    },
    {
      level: 'CRITICAL (75–100)',
      action: 'BLOCK_AND_VERIFY',
      color: 'border-red-800 bg-red-950/30 text-red-400',
      description: 'Simulate immediate hold on requested wire transactions. Send push MFA challenge. Generate critical SOC alert.'
    },
  ];

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const res = await triggerSecurityResponse(testCallId, simLevel);
      if (res.success) {
        setResponseLog(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-3">
            SECURITY RESPONSE WORKFLOW & SIMULATION
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Member 6 automated response policy engine: transaction hold simulation, MFA push, out-of-band callback dispatch.
          </p>
        </div>
      </div>

      {/* Policy Rules Matrix */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200 font-mono">AUTOMATED RESPONSE POLICY MATRIX</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {policies.map((p, idx) => (
            <div key={idx} className={`p-4 rounded-xl border ${p.color} space-y-2`}>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider block">{p.level}</span>
              <p className="font-mono text-xs font-bold text-white">{p.action}</p>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Simulation Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-4 font-mono text-xs">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Lock className="w-4 h-4 text-soc-cyan" />
            SECURITY DISPATCH SIMULATOR
          </h3>

          <div>
            <label className="text-slate-400 block mb-1">Target Call ID</label>
            <input
              type="text"
              value={testCallId}
              onChange={(e) => setTestCallId(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 text-slate-200 rounded-lg p-2.5 text-xs focus:border-soc-cyan focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Simulated Threat Level</label>
            <select
              value={simLevel}
              onChange={(e) => setSimLevel(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 text-slate-200 rounded-lg p-2.5 text-xs focus:border-soc-cyan focus:outline-none"
            >
              <option value="CRITICAL">CRITICAL (75-100)</option>
              <option value="HIGH">HIGH (50-74)</option>
              <option value="MEDIUM">MEDIUM (25-49)</option>
              <option value="LOW">LOW (0-24)</option>
            </select>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-soc-cyan to-blue-600 hover:from-soc-cyanLight hover:to-blue-500 text-slate-950 font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <Play className="w-4 h-4 fill-current" />
            DISPATCH SECURITY PROTOCOL
          </button>
        </div>

        {/* Simulation Output Log */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 p-5 rounded-xl font-mono text-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            DISPATCH EXECUTION OUTPUT
          </h3>

          {responseLog ? (
            <div className="bg-[#0b0f19] p-4 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-soc-cyan font-bold">ACTION: {responseLog.action_type}</span>
                <span className="text-[10px] text-emerald-400 border border-emerald-800 bg-emerald-950/60 px-2 py-0.5 rounded">
                  {responseLog.execution_status}
                </span>
              </div>
              <p className="text-slate-300 text-xs font-sans">{responseLog.details?.simulation_notice}</p>
              <p className="text-slate-400 text-xs font-sans">{responseLog.details?.mitigation}</p>
            </div>
          ) : (
            <div className="h-40 border border-dashed border-slate-800 rounded-lg flex items-center justify-center text-slate-500">
              Click "DISPATCH SECURITY PROTOCOL" to view simulated execution result.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
