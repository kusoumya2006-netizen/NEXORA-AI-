import React from 'react';
import { ShieldAlert, Activity, Cpu, Bell, CheckCircle2 } from 'lucide-react';

export default function Navbar({ modelMode = 'mock', activeAlertCount = 2 }) {
  return (
    <header className="h-16 bg-[#0a0e1a] border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-soc-cyan to-blue-600 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.4)]">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wider text-white font-mono flex items-center gap-2">
              NEXORA
              <span className="text-[10px] bg-soc-cyan/15 text-soc-cyan border border-soc-cyan/30 px-2 py-0.5 rounded font-mono font-medium">
                SIH 2026 SOC
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">AI Real-Time Voice Impersonation Defense</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Real-time Status Badge */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-mono">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 font-semibold">SHIELD ACTIVE</span>
        </div>

        {/* Engine Model Mode */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-mono text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-soc-cyan" />
          <span>ENGINE:</span>
          <span className="text-soc-cyan font-bold uppercase">{modelMode} MODE</span>
        </div>

        {/* Alerts Notification Bell */}
        <div className="relative">
          <button className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-700 transition">
            <Bell className="w-4 h-4" />
            {activeAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {activeAlertCount}
              </span>
            )}
          </button>
        </div>

        {/* Analyst Profile */}
        <div className="flex items-center gap-2.5 border-l border-slate-800 pl-4">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-soc-cyan">
            M1
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-slate-200">Lead SOC Analyst</p>
            <p className="text-[10px] text-slate-400 font-mono">Integration Lead</p>
          </div>
        </div>
      </div>
    </header>
  );
}
