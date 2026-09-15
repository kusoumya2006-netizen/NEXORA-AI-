import React from 'react';
import { BarChart3, TrendingUp, Shield, Activity } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  ScatterChart,
  Scatter
} from 'recharts';

export default function RiskAnalytics() {
  // Demo dataset representing SIH 2026 threat vector analytics over time
  const threatTrends = [
    { time: '08:00', total: 42, synthetic: 8, critical: 2 },
    { time: '10:00', total: 85, synthetic: 19, critical: 5 },
    { time: '12:00', total: 120, synthetic: 31, critical: 9 },
    { time: '14:00', total: 98, synthetic: 24, critical: 7 },
    { time: '16:00', total: 145, synthetic: 48, critical: 14 },
    { time: '18:00', total: 110, synthetic: 35, critical: 8 },
  ];

  const featureWeights = [
    { feature: 'Voice Authenticity (Member 2)', weight: 35, color: '#06b6d4' },
    { feature: 'Speaker Verification (Member 3)', weight: 25, color: '#f59e0b' },
    { feature: 'Conversation Intent (Member 4)', weight: 25, color: '#ef4444' },
    { feature: 'Acoustic Anomaly (Member 3)', weight: 15, color: '#8b5cf6' },
  ];

  const intentDist = [
    { intent: 'Financial Wire', count: 18, risk: 91 },
    { intent: 'OTP Harvesting', count: 14, risk: 82 },
    { intent: 'Bank Route Update', count: 8, risk: 46 },
    { intent: 'Routine Service', count: 42, risk: 12 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-3">
            DYNAMIC RISK ANALYTICS & THREAT TRENDS
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated telemetry detailing synthetic voice frequency, biometric mismatch distribution, and intent vectors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Volumes Chart */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 font-mono flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-soc-cyan" />
            SYNTHETIC VOICE THREAT VOLUME OVER TIME
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={threatTrends}>
                <defs>
                  <linearGradient id="colorSyn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px' }} />
                <Area type="monotone" dataKey="synthetic" stroke="#ef4444" fillOpacity={1} fill="url(#colorSyn)" name="Synthetic Voice Attacks" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Weight Allocation Chart */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 font-mono flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            DYNAMIC RISK ENGINE FEATURE WEIGHT ALLOCATION
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureWeights} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={11} domain={[0, 40]} />
                <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={10} width={180} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px' }} />
                <Bar dataKey="weight" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Weight (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
