import React from 'react';

export default function ThreatBadge({ level = 'LOW', className = '' }) {
  const norm = (level || 'LOW').toUpperCase();

  let colors = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80';
  let dot = 'bg-emerald-400';

  if (norm === 'CRITICAL') {
    colors = 'bg-red-950/80 text-red-400 border-red-700/80 animate-pulse';
    dot = 'bg-red-500';
  } else if (norm === 'HIGH') {
    colors = 'bg-orange-950/70 text-orange-400 border-orange-700/80';
    dot = 'bg-orange-400';
  } else if (norm === 'MEDIUM') {
    colors = 'bg-amber-950/70 text-amber-400 border-amber-700/80';
    dot = 'bg-amber-400';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      {norm}
    </span>
  );
}
