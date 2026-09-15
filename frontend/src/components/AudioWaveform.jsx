import React, { useEffect, useState } from 'react';

export default function AudioWaveform({ isAnalyzing = false }) {
  const [bars, setBars] = useState(Array.from({ length: 32 }, () => 20));

  useEffect(() => {
    if (!isAnalyzing) {
      setBars(Array.from({ length: 32 }, () => 15));
      return;
    }

    const interval = setInterval(() => {
      setBars(Array.from({ length: 32 }, () => Math.floor(Math.random() * 75) + 15));
    }, 120);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  return (
    <div className="flex items-end justify-between h-20 bg-[#090d16] p-3 rounded-lg border border-slate-800/80 gap-1 overflow-hidden">
      {bars.map((height, i) => (
        <div
          key={i}
          style={{ height: `${height}%` }}
          className={`w-full rounded-t-sm transition-all duration-100 ${
            isAnalyzing
              ? i % 5 === 0
                ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                : 'bg-soc-cyan shadow-[0_0_6px_rgba(6,182,212,0.4)]'
              : 'bg-slate-700/50'
          }`}
        />
      ))}
    </div>
  );
}
