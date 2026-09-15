import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, Cpu, FileText, Lock, ChevronRight, UserCheck, AlertOctagon } from 'lucide-react';
import ThreatBadge from '../components/ThreatBadge';
import RiskGauge from '../components/RiskGauge';
import { fetchCalls, fetchCallDetail } from '../services/api';

export default function CallInvestigation({ selectedCallId, onSelectCall }) {
  const [callsList, setCallsList] = useState([]);
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeCallId, setActiveCallId] = useState(selectedCallId || 'NX-10482');

  useEffect(() => {
    async function loadCalls() {
      try {
        const res = await fetchCalls();
        if (res.success && res.data) {
          setCallsList(res.data);
          if (!selectedCallId && res.data.length > 0) {
            setActiveCallId(res.data[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadCalls();
  }, [selectedCallId]);

  useEffect(() => {
    if (!activeCallId) return;
    async function loadDetail() {
      setLoading(true);
      try {
        const res = await fetchCallDetail(activeCallId);
        if (res.success) {
          setDetailData(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [activeCallId]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-3">
            SOC CALL INVESTIGATION CONSOLE
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Deep forensic breakdown of intercepted audio, speaker embedding distances, NLP coercion intent, and audit trail.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List of Intercepted Calls */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
              INTERCEPTED SESSIONS ({callsList.length})
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {callsList.map((c) => {
                const isSelected = c.id === activeCallId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveCallId(c.id)}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      isSelected
                        ? 'bg-soc-cyan/15 border-soc-cyan/40 text-white'
                        : 'bg-[#0b0f19] border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-xs mb-1">
                      <span className="font-bold text-soc-cyan">{c.id}</span>
                      <ThreatBadge level={c.risk_level} />
                    </div>
                    <p className="text-xs font-semibold text-slate-200 truncate">{c.caller_claimed_identity || 'Unknown'}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                      <span>{c.channel}</span>
                      <span className="font-bold">{c.risk_score} / 100 Risk</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Deep Forensic Detail View */}
        <div className="lg:col-span-8 space-y-6">
          {loading ? (
            <div className="bg-slate-900/40 border border-slate-800 h-96 rounded-xl flex items-center justify-center text-slate-400 font-mono text-xs">
              Fetching forensic telemetry for call {activeCallId}...
            </div>
          ) : detailData ? (
            <div className="space-y-6">
              {/* Session Overview Card */}
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-xl space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
                  <div>
                    <h3 className="text-lg font-bold font-mono text-white flex items-center gap-3">
                      SESSION {detailData.call.id}
                      <ThreatBadge level={detailData.risk_assessment?.risk_level} />
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      Claimed Speaker: <strong className="text-slate-200">{detailData.call.caller_claimed_identity}</strong> ({detailData.call.caller_phone})
                    </p>
                  </div>
                  <RiskGauge score={detailData.risk_assessment?.risk_score || 0} level={detailData.risk_assessment?.risk_level || 'LOW'} />
                </div>

                {/* Call Transcript Block */}
                {detailData.call.transcript && (
                  <div className="bg-[#0b0f19] p-4 rounded-lg border border-slate-800">
                    <p className="text-[11px] text-slate-400 font-mono font-bold uppercase mb-1">INTERCEPTED CALL TRANSCRIPT</p>
                    <p className="text-xs text-slate-200 font-mono leading-relaxed">"{detailData.call.transcript}"</p>
                  </div>
                )}

                {/* 3 Component Breakdown Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                  {/* Voice Detection */}
                  <div className="bg-[#0b0f19] p-4 rounded-lg border border-slate-800 space-y-2">
                    <span className="text-[10px] text-soc-cyan font-bold block">MEMBER 2 — VOICE CLONING</span>
                    <p className="text-slate-300">Synthetic Confidence: <strong className="text-white">{intPercent(detailData.voice_analysis?.synthetic_probability)}%</strong></p>
                    <p className="text-slate-300">Voice Authenticity: <strong className="text-soc-cyan">{detailData.voice_analysis?.voice_authenticity_score}%</strong></p>
                    <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                      <p className="font-bold text-slate-300 mb-1">Spectral Artifacts:</p>
                      {(detailData.voice_analysis?.spectral_artifacts || []).length > 0 ? (
                        detailData.voice_analysis.spectral_artifacts.map((a, i) => (
                          <p key={i} className="text-red-400">• {a}</p>
                        ))
                      ) : (
                        <p className="text-emerald-400">None detected</p>
                      )}
                    </div>
                  </div>

                  {/* Speaker Acoustics */}
                  <div className="bg-[#0b0f19] p-4 rounded-lg border border-slate-800 space-y-2">
                    <span className="text-[10px] text-amber-400 font-bold block">MEMBER 3 — SPEAKER & ACOUSTICS</span>
                    <p className="text-slate-300">Speaker Match: <strong className="text-white">{intPercent(detailData.speaker_verification?.speaker_match_probability)}%</strong></p>
                    <p className="text-slate-300">Embedding Distance: <strong className="text-amber-400">{detailData.speaker_verification?.embedding_distance}</strong></p>
                    <p className="text-slate-300">Acoustic Anomaly: <strong className="text-red-400">{intPercent(detailData.speaker_verification?.audio_anomaly_score)}%</strong></p>
                    <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                      <p>Pitch Std: {detailData.speaker_verification?.acoustic_pitch_std} Hz</p>
                      <p>Noise SNR: {detailData.speaker_verification?.background_noise_snr} dB</p>
                    </div>
                  </div>

                  {/* Conversation Risk */}
                  <div className="bg-[#0b0f19] p-4 rounded-lg border border-slate-800 space-y-2">
                    <span className="text-[10px] text-red-400 font-bold block">MEMBER 4 — INTENT & RISK</span>
                    <p className="text-slate-300">Category: <strong className="text-white">{detailData.conversation_analysis?.intent_category}</strong></p>
                    <p className="text-slate-300">Urgency: <strong className="text-red-400">{detailData.conversation_analysis?.urgency_level}</strong></p>
                    <p className="text-slate-300">Coercion Prob: <strong className="text-red-400">{intPercent(detailData.conversation_analysis?.coercion_probability)}%</strong></p>
                  </div>
                </div>

                {/* Audit Trail Timeline */}
                <div className="space-y-3 pt-4 border-t border-slate-800 font-mono">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-soc-cyan" />
                    FORENSIC AUDIT TRAIL
                  </h4>
                  <div className="space-y-2">
                    {(detailData.audit_trail || []).map((log, idx) => (
                      <div key={idx} className="bg-[#0b0f19] p-3 rounded-lg border border-slate-800 flex items-start justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-soc-cyan font-bold">{log.event_type}</span>
                            <span className="text-[10px] text-slate-500">[{log.actor}]</span>
                          </div>
                          <p className="text-slate-300 text-[11px]">{log.details}</p>
                        </div>
                        <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function intPercent(val) {
  return Math.round((val || 0) * 100);
}
