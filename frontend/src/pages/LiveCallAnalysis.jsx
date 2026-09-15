import React, { useState, useRef } from "react";
import {
  Play, RotateCcw, AlertTriangle, ShieldCheck, Lock, Activity,
  CheckCircle, Upload, Mic, Square, FileAudio, Radio, Volume2, UserCheck, UserX, AlertOctagon
} from "lucide-react";
import AudioWaveform from "../components/AudioWaveform";
import RiskGauge from "../components/RiskGauge";
import ThreatBadge from "../components/ThreatBadge";
import { triggerAnalyze, triggerAnalyzeFormData } from "../services/api";

export default function LiveCallAnalysis({ onAnalysisComplete }) {
  const [inputMode, setInputMode] = useState("preset"); // preset | upload | record
  const [selectedPreset, setSelectedPreset] = useState("FINANCIAL_TRANSFER_ATTACK");
  const [callerName, setCallerName] = useState("Marcus Vance");
  const [callerPhone, setCallerPhone] = useState("+1 (555) 019-4820");
  const [transcriptInput, setTranscriptInput] = useState(
    "Hello, this is Marcus Vance. I am trapped in an emergency investor meeting overseas and need you to urgently execute an immediate wire transfer of $250,000 right now!"
  );

  // File upload state
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  // Microphone recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const presets = [
    {
      id: "FINANCIAL_TRANSFER_ATTACK",
      label: "Financial Transfer Attack (CRITICAL)",
      caller: "Marcus Vance",
      phone: "+1 (555) 019-4820",
      transcript: "Hello, this is Marcus Vance. I am trapped in an emergency investor meeting overseas and need you to urgently execute an immediate wire transfer of $250,000 right now!"
    },
    {
      id: "OTP_HARVESTING",
      label: "OTP / Credential Harvesting (HIGH)",
      caller: "Sarah Jenkins",
      phone: "+1 (555) 014-9921",
      transcript: "Hi team, I lost my corporate authenticator device. Please read out the 6-digit SMS verification code sent to your terminal so I can log into banking."
    },
    {
      id: "LEGITIMATE_CALL",
      label: "Legitimate Customer Call (LOW)",
      caller: "David Miller",
      phone: "+1 (555) 012-3341",
      transcript: "Hello, this is David from IT support checking in on your workstation upgrade. Let me know if you need assistance with software updates."
    },
    {
      id: "ROUTINE_VENDOR",
      label: "Vendor Banking Route Change (MEDIUM)",
      caller: "Acuity Logistics Rep",
      phone: "+1 (800) 555-8849",
      transcript: "Good morning, calling to follow up on invoice payment #8849. We updated our ABA routing number to Chase Manhattan, please confirm receipt."
    }
  ];

  const handleSelectPreset = (e) => {
    const pId = e.target.value;
    setSelectedPreset(pId);
    const pObj = presets.find(p => p.id === pId);
    if (pObj) {
      setCallerName(pObj.caller);
      setCallerPhone(pObj.phone);
      setTranscriptInput(pObj.transcript);
    }
  };

  // Handle file picker
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  // Start microphone recording
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const recordedFile = new File([audioBlob], "recorded_call.wav", { type: "audio/wav" });
        setAudioFile(recordedFile);
        setAudioUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start(200);
      setIsRecording(true);
      setRecordDuration(0);
      timerRef.current = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error(err);
      setErrorMessage("Microphone access denied or unavailable in this environment.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setErrorMessage(null);

    try {
      let res;
      if (inputMode === "upload" || inputMode === "record") {
        if (!audioFile) {
          setErrorMessage("Please select or record an audio file before initiating inspection.");
          setIsAnalyzing(false);
          return;
        }
        const formData = new FormData();
        formData.append("audio", audioFile);
        if (callerName) formData.append("caller_claimed_identity", callerName);
        if (callerPhone) formData.append("caller_phone", callerPhone);
        if (transcriptInput) formData.append("transcript", transcriptInput);
        if (inputMode === "preset") formData.append("preset_scenario", selectedPreset);

        res = await triggerAnalyzeFormData(formData);
      } else {
        // Preset mode
        const payload = {
          session_id: `NX-${Math.floor(10000 + Math.random() * 90000)}`,
          caller_claimed_identity: callerName,
          caller_phone: callerPhone,
          transcript: transcriptInput,
          preset_scenario: selectedPreset
        };
        res = await triggerAnalyze(payload);
      }

      if (res.success) {
        setAnalysisResult(res.data);
        if (onAnalysisComplete) onAnalysisComplete();
      } else {
        setErrorMessage(res.error?.message || "Analysis failed to complete.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network or server error during analysis. Ensure backend is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-3">
            LIVE VOICE INTERCEPT & THREAT ANALYZER
            <span className="text-xs bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded font-mono font-bold animate-pulse">
              ACTIVE INTERCEPT
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end voice authenticity detection, speaker biometric verification, acoustic telemetry, and automated security shield.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Call Simulator & Audio Ingestion Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 font-mono flex items-center gap-2">
                <Radio className="w-4 h-4 text-soc-cyan" />
                INPUT INTERCEPT STREAM
              </h3>
            </div>

            {/* Input Mode Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-[#090d16] p-1.5 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setInputMode("preset")}
                className={`py-1.5 rounded text-center transition ${
                  inputMode === "preset" ? "bg-soc-cyan text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Attack Presets
              </button>
              <button
                onClick={() => setInputMode("upload")}
                className={`py-1.5 rounded text-center transition ${
                  inputMode === "upload" ? "bg-soc-cyan text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Upload Audio
              </button>
              <button
                onClick={() => setInputMode("record")}
                className={`py-1.5 rounded text-center transition ${
                  inputMode === "record" ? "bg-soc-cyan text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Live Record
              </button>
            </div>

            {/* Mode 1: Attack Preset Controls */}
            {inputMode === "preset" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Attack Scenario Preset</label>
                  <select
                    value={selectedPreset}
                    onChange={handleSelectPreset}
                    className="w-full bg-[#0b0f19] border border-slate-700 text-slate-200 rounded-lg p-2.5 text-xs font-mono focus:border-soc-cyan focus:outline-none"
                  >
                    {presets.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Mode 2: Audio File Upload */}
            {inputMode === "upload" && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-400 block">Select Audio Intercept (.wav, .mp3, .m4a, .flac)</label>
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-700 hover:border-soc-cyan rounded-lg cursor-pointer bg-[#0b0f19] transition">
                  <Upload className="w-6 h-6 text-soc-cyan mb-2" />
                  <span className="text-xs text-slate-300 font-mono">
                    {audioFile ? audioFile.name : "Choose or drop audio file here"}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">WAV, MP3, FLAC, M4A up to 25MB</span>
                  <input
                    type="file"
                    accept=".wav,.mp3,.m4a,.flac,.ogg,.webm"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Mode 3: Live Microphone Recording */}
            {inputMode === "record" && (
              <div className="space-y-3 bg-[#0b0f19] p-4 rounded-lg border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-3">
                  {isRecording ? (
                    <button
                      onClick={stopRecording}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-2 animate-pulse"
                    >
                      <Square className="w-4 h-4" />
                      STOP RECORDING ({recordDuration}s)
                    </button>
                  ) : (
                    <button
                      onClick={startRecording}
                      className="px-4 py-2 bg-soc-cyan hover:bg-soc-cyanLight text-slate-950 font-mono text-xs font-bold rounded-lg flex items-center gap-2"
                    >
                      <Mic className="w-4 h-4" />
                      START MICROPHONE CAPTURE
                    </button>
                  )}
                </div>
                {audioFile && !isRecording && (
                  <p className="text-xs text-emerald-400 font-mono mt-2">
                    ✓ Microphone sample captured ({audioFile.size} bytes)
                  </p>
                )}
              </div>
            )}

            {/* Caller Claim Identity & Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Claimed Caller Identity</label>
                <input
                  type="text"
                  value={callerName}
                  onChange={(e) => setCallerName(e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  className="w-full bg-[#0b0f19] border border-slate-700 text-slate-200 rounded-lg p-2 text-xs font-mono focus:border-soc-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Caller Inbound CLI</label>
                <input
                  type="text"
                  value={callerPhone}
                  onChange={(e) => setCallerPhone(e.target.value)}
                  placeholder="+1 (555) ..."
                  className="w-full bg-[#0b0f19] border border-slate-700 text-slate-200 rounded-lg p-2 text-xs font-mono focus:border-soc-cyan focus:outline-none"
                />
              </div>
            </div>

            {/* Audio Transcript Input / Preview */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Call Audio Transcript {inputMode !== "preset" && "(Optional - STT will transcribe if omitted)"}
              </label>
              <textarea
                rows={3}
                value={transcriptInput}
                onChange={(e) => setTranscriptInput(e.target.value)}
                placeholder="Spoken conversation text..."
                className="w-full bg-[#0b0f19] border border-slate-700 text-slate-200 rounded-lg p-2.5 text-xs font-mono focus:border-soc-cyan focus:outline-none"
              />
            </div>

            {/* Audio Playback Player if available */}
            {audioUrl && (
              <div className="bg-[#0b0f19] p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs text-soc-cyan font-mono">
                  <Volume2 className="w-4 h-4" />
                  <span>PLAYBACK INTERCEPTED AUDIO</span>
                </div>
                <audio controls src={audioUrl} className="w-full h-8" />
              </div>
            )}

            {/* Audio Waveform Visualizer */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-mono">
                <span>ACOUSTIC SPECTRUM DYNAMICS</span>
                <span>{isAnalyzing || isRecording ? "SAMPLING 16kHz PCM" : "STANDBY"}</span>
              </div>
              <AudioWaveform isAnalyzing={isAnalyzing || isRecording} />
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-lg text-xs font-mono flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              onClick={handleStartAnalysis}
              disabled={isAnalyzing || isRecording}
              className="w-full py-3 bg-gradient-to-r from-soc-cyan to-blue-600 hover:from-soc-cyanLight hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.4)] transition flex items-center justify-center gap-2 font-mono uppercase tracking-wider"
            >
              {isAnalyzing ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-slate-950" />
                  ANALYZING VOICE WAVEFORM & BIOMETRICS...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  EXECUTE FULL SECURITY INSPECTION
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Detection Results Dashboard */}
        <div className="lg:col-span-7 space-y-4">
          {analysisResult ? (
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-xl space-y-5">
              {/* Session Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
                <div>
                  <p className="text-xs text-slate-400 font-mono">SESSION ID: <strong className="text-soc-cyan">{analysisResult.session_id}</strong></p>
                  <p className="text-xs text-slate-200 font-semibold mt-0.5">Claimed Identity: {callerName} ({callerPhone})</p>
                </div>
                <div className="flex items-center gap-3">
                  <ThreatBadge level={analysisResult.risk_level} />
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded font-bold">
                    INSPECTION COMPLETE
                  </span>
                </div>
              </div>

              {/* 5 Core Questions Visual Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Is this voice genuine? */}
                <div className="bg-[#0b0f19] p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-slate-400 font-bold">1. IS VOICE GENUINE?</span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      analysisResult.voice_analysis?.is_ai_generated
                        ? "bg-red-950 text-red-400 border border-red-800"
                        : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                    }`}>
                      {analysisResult.voice_analysis?.status || (analysisResult.voice_analysis?.is_ai_generated ? "AI-GENERATED" : "AUTHENTIC")}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-2xl font-bold font-mono text-white">
                      {analysisResult.voice_analysis?.voice_authenticity_score}%
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Clone Prob: <strong className="text-red-400">{Math.round((analysisResult.voice_analysis?.synthetic_probability || 0) * 100)}%</strong>
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div
                      className="bg-soc-cyan h-1.5 rounded-full"
                      style={{ width: `${analysisResult.voice_analysis?.voice_authenticity_score || 0}%` }}
                    />
                  </div>
                  {analysisResult.voice_analysis?.spectral_artifacts?.length > 0 && (
                    <div className="text-[10px] text-red-400 font-mono pt-1 space-y-0.5">
                      {analysisResult.voice_analysis.spectral_artifacts.map((art, idx) => (
                        <p key={idx}>• {art}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Does it match expected speaker? */}
                <div className="bg-[#0b0f19] p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-slate-400 font-bold">2. SPEAKER BIOMETRICS</span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      analysisResult.speaker_verification?.verification_status === "VERIFIED"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : analysisResult.speaker_verification?.verification_status === "MISMATCH"
                        ? "bg-red-950 text-red-400 border border-red-800"
                        : "bg-amber-950 text-amber-400 border border-amber-800"
                    }`}>
                      {analysisResult.speaker_verification?.verification_status || "CHECKED"}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-2xl font-bold font-mono text-white">
                      {Math.round((analysisResult.speaker_verification?.speaker_match_probability || 0) * 100)}%
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Distance: <strong className="text-amber-400">{analysisResult.speaker_verification?.embedding_distance}</strong>
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div
                      className="bg-amber-400 h-1.5 rounded-full"
                      style={{ width: `${Math.round((analysisResult.speaker_verification?.speaker_match_probability || 0) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono pt-1">
                    Noise SNR: {analysisResult.speaker_verification?.background_noise_snr} dB | Pitch Std: {analysisResult.speaker_verification?.acoustic_pitch_std} Hz
                  </p>
                </div>
              </div>

              {/* 3. Transcript & Detected Intent */}
              <div className="bg-[#0b0f19] p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between font-mono text-xs border-b border-slate-800/80 pb-2">
                  <span className="text-slate-300 font-bold flex items-center gap-2">
                    3. CONVERSATION INTENT & STT TRANSCRIPT
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-soc-cyan font-mono">
                      INTENT: {analysisResult.conversation_analysis?.intent_category}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-400 font-mono border border-red-800">
                      URGENCY: {analysisResult.conversation_analysis?.urgency_level}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-200 font-mono italic leading-relaxed pt-1">
                  "{analysisResult.transcript || analysisResult.transcription?.text}"
                </p>
                {analysisResult.conversation_analysis?.suspicious_keywords?.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {analysisResult.conversation_analysis.suspicious_keywords.map((kw, i) => (
                      <span key={i} className="text-[10px] bg-red-950/60 text-red-300 border border-red-900/80 px-2 py-0.5 rounded font-mono">
                        ⚠ {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Risk Gauge & Threat Factors */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#0b0f19] p-4 rounded-xl border border-slate-800">
                <div className="md:col-span-5 flex flex-col items-center justify-center">
                  <RiskGauge score={analysisResult.risk_score} level={analysisResult.risk_level} />
                </div>
                <div className="md:col-span-7 space-y-2 font-mono text-xs">
                  <h4 className="font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    PRIMARY RISK FACTORS EVALUATED
                  </h4>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {analysisResult.reasons.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-400 font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 5. Triggered Automated Security Response */}
              <div className={`p-4 rounded-xl border ${
                analysisResult.security_response?.hold_transaction
                  ? "bg-red-950/60 border-red-800/80 text-red-200"
                  : "bg-emerald-950/40 border-emerald-800/80 text-emerald-200"
              }`}>
                <div className="flex items-center justify-between font-mono text-xs font-bold">
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    5. AUTOMATED SECURITY ACTION DISPATCHED
                  </span>
                  <span className="px-2.5 py-1 rounded bg-black/50 border border-current text-xs">
                    {analysisResult.security_response?.action_type || analysisResult.recommended_action}
                  </span>
                </div>
                <p className="text-xs mt-2 text-slate-300 font-sans leading-relaxed">
                  {analysisResult.security_response?.details?.simulation_notice}
                </p>
                <p className="text-[11px] mt-1 font-mono text-slate-400">
                  Mitigation Policy: {analysisResult.security_response?.details?.mitigation}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 h-full min-h-[440px] rounded-xl flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
              <Activity className="w-12 h-12 text-slate-700 animate-pulse" />
              <p className="text-sm font-mono font-medium text-slate-300">AWAITING VOICE INTERCEPT STREAM</p>
              <p className="text-xs max-w-md text-slate-400">
                Select an attack scenario preset, upload an intercepted audio file, or use your live microphone to execute full multi-factor detection.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
