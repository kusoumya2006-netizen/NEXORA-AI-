import React from 'react';

export default function RiskGauge({ score = 0, level = 'LOW', size = 'md' }) {
  const normalizedScore = Math.max(0, Math.min(100, score));

  let colorClass = 'text-emerald-500';
  let strokeColor = '#10b981';

  if (normalizedScore >= 75) {
    colorClass = 'text-red-500';
    strokeColor = '#ef4444';
  } else if (normalizedScore >= 50) {
    colorClass = 'text-orange-500';
    strokeColor = '#f97316';
  } else if (normalizedScore >= 25) {
    colorClass = 'text-amber-500';
    strokeColor = '#f59e0b';
  }

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg className="w-32 h-32 transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="#1f293d"
          strokeWidth="8"
          fill="transparent"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke={strokeColor}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold font-mono ${colorClass}`}>{normalizedScore}</span>
        <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">/ 100</span>
      </div>
      <span className={`mt-2 font-mono text-xs font-bold ${colorClass}`}>{level} THREAT</span>
    </div>
  );
}
