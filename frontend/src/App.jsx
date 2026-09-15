import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  AudioLines,
  Bell,
  ChevronRight,
  CircleAlert,
  Fingerprint,
  Gauge,
  Headphones,
  Menu,
  Mic,
  Network,
  Play,
  Radio,
  Shield,
  ShieldAlert,
  Sparkles,
  Terminal,
  Upload,
  Waves,
  X,
  Zap,
} from "lucide-react";

const API_BASE = "/api";

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.error?.message || `Request failed: ${response.status}`);
  }
  return payload;
}

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value) || 0));

function normalizeAnalysis(payload) {
  const data = payload?.data ?? payload ?? {};
  const voice = data.voice_analysis ?? {};
  const speaker = data.speaker_verification ?? {};
  const conversation = data.conversation_analysis ?? {};
  const security = data.security_response ?? {};

  return {
    ...data,
    riskScore: clamp(data.risk_score),
    riskLevel: String(data.risk_level || "LOW").toUpperCase(),
    reasons: Array.isArray(data.reasons) ? data.reasons : [],
    recommendedAction: data.recommended_action || security.action_type || "ALLOW",
    syntheticProbability: clamp((voice.synthetic_probability ?? 0) * 100),
    authenticity: clamp(voice.voice_authenticity_score ?? (1 - (voice.synthetic_probability ?? 0)) * 100),
    speakerMatch: clamp((speaker.speaker_match_probability ?? 0) * 100),
    speakerConsistency: clamp(speaker.speaker_consistency_score),
    conversationRisk: clamp(conversation.conversation_risk_score),
    urgency: conversation.urgency_level || "LOW",
    intent: conversation.intent_category || "INFORMATIONAL",
    keywords: Array.isArray(conversation.suspicious_keywords) ? conversation.suspicious_keywords : [],
    transcript: data.transcript || "",
    security,
  };
}

const demoAnalysis = normalizeAnalysis({
  risk_score: 78,
  risk_level: "HIGH",
  reasons: [
    "Synthetic audio indicators detected",
    "Caller identity is only partially consistent",
    "Conversation contains an urgent financial request",
  ],
  recommended_action: "VERIFY_OUT_OF_BAND",
  voice_analysis: { synthetic_probability: 0.82, voice_authenticity_score: 18 },
  speaker_verification: { speaker_match_probability: 0.91, speaker_consistency_score: 88 },
  conversation_analysis: {
    conversation_risk_score: 74,
    urgency_level: "HIGH",
    intent_category: "FINANCIAL_TRANSFER",
    suspicious_keywords: ["urgent", "send", "money", "OTP"],
  },
  transcript: "This is urgent. Please send the money now. Don't tell anyone.",
  security_response: { action_type: "HOLD_AND_VERIFY" },
});

const navItems = [
  ["overview", "Overview"],
  ["analysis", "Live Analysis"],
  ["history", "History"],
  ["system", "System"],
];

function Logo() {
  return (
    <div className="brand">
      <div className="brand-mark"><span /></div>
      <div>
        <div className="brand-name">NEXORA</div>
        <div className="brand-sub">VOICE SECURITY / 01</div>
      </div>
    </div>
  );
}

function Topbar({ page, onMenu, alertCount }) {
  return (
    <header className="topbar">
      <button className="mobile-menu" onClick={onMenu} aria-label="Open menu"><Menu size={19} /></button>
      <div className="crumb"><span>SECURITY OPERATIONS</span><ChevronRight size={13} /><b>{page.toUpperCase()}</b></div>
      <div className="top-actions">
        <span className="live-dot"><i /> SYSTEM ONLINE</span>
        <button className="icon-button" title="Alerts"><Bell size={17} />{alertCount > 0 && <em>{alertCount}</em>}</button>
      </div>
    </header>
  );
}

function Sidebar({ active, setActive, open, setOpen }) {
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-head"><Logo /><button className="close-menu" onClick={() => setOpen(false)}><X size={18} /></button></div>
      <div className="side-section">
        <span className="side-label">CONTROL</span>
        {navItems.map(([id, label], index) => (
          <button key={id} className={`nav-item ${active === id ? "active" : ""}`} onClick={() => { setActive(id); setOpen(false); }}>
            <span className="nav-index">0{index + 1}</span><span>{label}</span>{active === id && <span className="nav-line" />}
          </button>
        ))}
      </div>
      <div className="side-section">
        <span className="side-label">INTELLIGENCE</span>
        <button className={`nav-item ${active === "architecture" ? "active" : ""}`} onClick={() => { setActive("architecture"); setOpen(false); }}><Network size={15}/><span>Detection Stack</span></button>
        <button className={`nav-item ${active === "alerts" ? "active" : ""}`} onClick={() => { setActive("alerts"); setOpen(false); }}><ShieldAlert size={15}/><span>Alert Center</span></button>
      </div>
      <div className="sidebar-foot">
        <div className="system-mini"><span className="pulse" /><div><b>PIPELINE READY</b><small>FastAPI / NEXORA CORE</small></div></div>
        <div className="build">BUILD 0.9.4 <span>SIH 26</span></div>
      </div>
    </aside>
  );
}

function Waveform({ active = false }) {
  const bars = [18, 28, 46, 24, 60, 42, 78, 36, 54, 26, 68, 44, 88, 48, 30, 56, 76, 40, 22, 62, 34, 82, 52, 28, 70, 46, 24, 58, 38, 74, 42, 20, 64, 30, 52, 78, 34, 58, 26, 68, 44, 82, 36, 54, 28, 66, 40, 74, 22, 56, 34, 70, 46];
  return <div className={`wave ${active ? "is-live" : ""}`}>{bars.map((h, i) => <i key={i} style={{ height: `${h}%`, animationDelay: `${(i % 9) * 80}ms` }} />)}</div>;
}

function ScoreRing({ score, label, tone = "cyan" }) {
  const circumference = 2 * Math.PI * 47;
  const dash = circumference * (clamp(score) / 100);
  return (
    <div className={`score-ring ${tone}`}>
      <svg viewBox="0 0 110 110">
        <circle className="ring-track" cx="55" cy="55" r="47" />
        <circle className="ring-value" cx="55" cy="55" r="47" strokeDasharray={`${dash} ${circumference}`} />
      </svg>
      <div className="ring-center"><strong>{Math.round(score)}</strong><span>/ 100</span></div>
      <small>{label}</small>
    </div>
  );
}

function SignalRow({ index, title, meta, value, icon: Icon, tone = "cyan" }) {
  return (
    <div className="signal-row">
      <div className={`signal-icon ${tone}`}><Icon size={17} /></div>
      <div className="signal-copy"><span>{index} / {title}</span><small>{meta}</small></div>
      <div className="signal-value">{value}</div>
      <div className="signal-arrow"><ArrowUpRight size={15} /></div>
    </div>
  );
}

function Overview({ setActive, analysis, calls, alerts }) {
  const risk = analysis?.riskScore ?? 24;
  const riskLevel = analysis?.riskLevel ?? "LOW";
  return (
    <div className="page-shell">
      <section className="hero-grid">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-line" /> REAL-TIME VOICE INTELLIGENCE</span>
          <h1>YOUR VOICE<br /><span>IS NO LONGER</span><br />PROOF OF IDENTITY.</h1>
          <p>NEXORA correlates speaker identity, audio authenticity and conversational intent before trust is granted.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => setActive("analysis")}><Play size={15} /> RUN LIVE ANALYSIS</button>
            <button className="text-button" onClick={() => setActive("architecture")}>EXPLORE THE STACK <ArrowDownRight size={15}/></button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="orb-grid" />
          <div className="orb"><div className="orb-core"><AudioLines size={34}/><span>LISTENING</span></div></div>
          <div className="orb-tag tag-a">VOICE INPUT <b>ACTIVE</b></div>
          <div className="orb-tag tag-b">SIGNAL <b>01</b></div>
          <div className="orb-tag tag-c">NEXORA CORE <b>ONLINE</b></div>
        </div>
      </section>

      <section className="manifesto">
        <div className="manifesto-number">01</div>
        <div>
          <span className="eyebrow">THE THREAT</span>
          <h2>A VOICE CAN BE<br /><em>REPLICATED.</em></h2>
        </div>
        <p>Generative AI has changed the trust model of communication. Familiar sound is no longer sufficient evidence of identity.</p>
      </section>

      <section className="stack-section">
        <div className="section-head"><div><span className="eyebrow">THE NEXORA STACK</span><h2>FROM SOUND<br />TO <em>DECISION.</em></h2></div><span className="section-note">04 LAYERS / ONE RISK MODEL</span></div>
        <div className="signal-list">
          <SignalRow index="01" title="SPEAKER VERIFICATION" meta="WHO IS SPEAKING?" value="IDENTITY" icon={Fingerprint} />
          <SignalRow index="02" title="AUDIO FORENSICS" meta="IS THE VOICE REAL?" value="AUTHENTICITY" icon={Waves} tone="violet" />
          <SignalRow index="03" title="NLP ANALYSIS" meta="WHAT ARE THEY ASKING?" value="INTENT" icon={Sparkles} tone="amber" />
          <SignalRow index="04" title="RISK ENGINE" meta="SHOULD YOU TRUST IT?" value="DECISION" icon={Gauge} tone="red" />
        </div>
      </section>

      <section className="dashboard-band">
        <div className="section-head compact"><div><span className="eyebrow">SECURITY PULSE</span><h2>THE SYSTEM<br /><em>SEES THE SIGNAL.</em></h2></div><button className="text-button" onClick={() => setActive("analysis")}>OPEN CONSOLE <ChevronRight size={15}/></button></div>
        <div className="pulse-grid">
          <div className="pulse-card primary"><span>OVERALL RISK</span><div className="risk-big">{Math.round(risk)}<small>/100</small></div><div className={`status-pill ${riskLevel.toLowerCase()}`}>{riskLevel}</div><div className="meter"><i style={{width: `${risk}%`}} /></div></div>
          <div className="pulse-card"><span>ACTIVE ALERTS</span><strong>{alerts}</strong><small>elevated sessions</small></div>
          <div className="pulse-card"><span>ANALYSES</span><strong>{calls.length || "—"}</strong><small>recorded sessions</small></div>
          <div className="pulse-card"><span>ENGINE</span><strong>4/4</strong><small>signals online</small></div>
        </div>
      </section>
    </div>
  );
}

function LiveAnalysis({ onComplete, analysis, setAnalysis }) {
  const [transcript, setTranscript] = useState("This is urgent. Please send the money now. Don't tell anyone.");
  const [identity, setIdentity] = useState("Known Contact");
  const [scenario, setScenario] = useState("FINANCIAL_TRANSFER_ATTACK");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [recording, setRecording] = useState(false);

  async function runAnalysis() {
    setRunning(true); setError("");
    try {
      const payload = {
        session_id: `web-${Date.now()}`,
        transcript,
        caller_claimed_identity: identity,
        preset_scenario: scenario || undefined,
        metadata: { source: "nexora-web-console" },
      };
      const result = await api("/pipeline/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const normalized = normalizeAnalysis(result);
      setAnalysis(normalized);
      onComplete?.(normalized);
    } catch (err) {
      setError(err.message || "Unable to reach NEXORA core.");
    } finally {
      setRunning(false);
    }
  }

  const view = analysis || demoAnalysis;

  return (
    <div className="page-shell">
      <div className="analysis-head"><div><span className="eyebrow">LIVE FORENSICS / 02</span><h1>IS THIS<br /><em>VOICE</em> REAL?</h1></div><div className="analysis-state"><span className={running ? "state-dot running" : "state-dot"} />{running ? "PROCESSING" : "READY"}<small>POST /pipeline/analyze</small></div></div>

      <div className="analysis-layout">
        <section className="console-main">
          <div className="console-label"><span>01 / AUDIO SIGNAL</span><span>STREAM 48KHZ / MONO</span></div>
          <div className="wave-stage"><div className="scanline" /><Waveform active={running || recording} /><div className="wave-time"><span>00:00:00</span><span>{recording ? "CAPTURING" : "READY"}</span></div></div>

          <div className="input-grid">
            <div className="input-block">
              <label>CLAIMED IDENTITY</label>
              <input value={identity} onChange={(e) => setIdentity(e.target.value)} placeholder="e.g. Arun" />
            </div>
            <div className="input-block">
              <label>SCENARIO</label>
              <select value={scenario} onChange={(e) => setScenario(e.target.value)}>
                <option value="FINANCIAL_TRANSFER_ATTACK">Financial transfer</option>
                <option value="OTP_HARVESTING">OTP harvesting</option>
                <option value="LEGITIMATE_CALL">Legitimate call</option>
                <option value="ROUTINE_VENDOR">Routine vendor</option>
              </select>
            </div>
          </div>

          <div className="transcript-block">
            <div className="console-label"><span>02 / CONVERSATION INPUT</span><span>NLP READY</span></div>
            <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} />
            <div className="transcript-footer"><span>{transcript.length} chars / context window</span><span>social-engineering signals enabled</span></div>
          </div>

          <div className="analysis-actions">
            <button className={`record-button ${recording ? "recording" : ""}`} onClick={() => setRecording(!recording)}><Mic size={16}/>{recording ? "STOP CAPTURE" : "CAPTURE AUDIO"}</button>
            <button className="primary-button large" onClick={runAnalysis} disabled={running}>{running ? <><Activity className="spin" size={16}/> ANALYZING SIGNAL</> : <><Zap size={16}/> ANALYZE WITH NEXORA</>}</button>
          </div>
          {error && <div className="error-banner"><CircleAlert size={16}/>{error}</div>}
        </section>

        <aside className="analysis-result">
          <div className="result-top"><span>03 / RISK ENGINE</span><span className="mono">{view.model_mode || "NEXORA CORE"}</span></div>
          <div className="result-score"><ScoreRing score={view.riskScore} label="RISK SCORE" tone={view.riskLevel === "HIGH" ? "red" : "cyan"} /></div>
          <div className={`result-level ${view.riskLevel.toLowerCase()}`}><span>THREAT LEVEL</span><strong>{view.riskLevel}</strong></div>
          <div className="result-metrics">
            <Metric label="Speaker match" value={`${Math.round(view.speakerMatch)}%`} icon={Fingerprint} />
            <Metric label="Synthetic probability" value={`${Math.round(view.syntheticProbability)}%`} icon={Waves} />
            <Metric label="Conversation risk" value={`${Math.round(view.conversationRisk)}%`} icon={Sparkles} />
          </div>
          <div className="reasons"><span className="eyebrow">WHY IT WAS FLAGGED</span>{(view.reasons.length ? view.reasons : ["No elevated indicators reported"]).map((reason, i) => <div key={i}><span>{String(i + 1).padStart(2, "0")}</span>{reason}</div>)}</div>
          <div className="recommended"><span>RECOMMENDED ACTION</span><strong>{view.recommendedAction}</strong></div>
        </aside>
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon }) {
  return <div className="metric"><Icon size={15}/><span>{label}</span><strong>{value}</strong></div>;
}

function Architecture() {
  const layers = [
    ["01", "SPEAKER VERIFICATION", "Identity confidence", Fingerprint],
    ["02", "AUDIO FORENSICS", "Synthetic probability", Waves],
    ["03", "NLP CONVERSATION", "Intent + coercion", Sparkles],
    ["04", "RISK FUSION", "Decision + response", ShieldAlert],
  ];
  return <div className="page-shell">
    <div className="architecture-hero"><span className="eyebrow">SYSTEM ARCHITECTURE / 03</span><h1>FOUR SIGNALS.<br /><em>ONE DECISION.</em></h1><p>NEXORA does not ask a single model whether a voice is fake. It correlates identity, audio authenticity and conversational behavior into an auditable risk assessment.</p></div>
    <div className="architecture-stack">{layers.map(([num, title, sub, Icon]) => <div className="arch-row" key={num}><span className="arch-num">{num}</span><div className="arch-icon"><Icon size={21}/></div><div className="arch-title"><h3>{title}</h3><span>{sub}</span></div><ArrowUpRight size={18}/></div>)}</div>
    <div className="architecture-flow"><div className="flow-node">AUDIO INPUT</div><span>→</span><div className="flow-node">PREPROCESS</div><span>→</span><div className="flow-node">MULTI-MODEL ANALYSIS</div><span>→</span><div className="flow-node hot">RISK ENGINE</div><span>→</span><div className="flow-node">ALERT / RESPONSE</div></div>
  </div>;
}

function History({ calls }) {
  return <div className="page-shell"><div className="analysis-head"><div><span className="eyebrow">SESSION ARCHIVE / 04</span><h1>THE <em>TRACE.</em></h1></div><span className="section-note">{calls.length} RECORDED</span></div>
    <div className="history-table"><div className="history-header"><span>SESSION</span><span>IDENTITY</span><span>RISK</span><span>STATUS</span><span>TIME</span></div>
      {calls.length ? calls.map((call, i) => <div className="history-row" key={call.id || i}><span className="mono">{String(call.id || `SESSION-${i + 1}`).slice(0, 18)}</span><span>{call.caller_claimed_identity || "Unknown caller"}</span><span className={`status-pill ${(call.risk_level || "low").toLowerCase()}`}>{call.risk_level || "LOW"}</span><span>{call.status || "COMPLETED"}</span><span>{call.timestamp ? new Date(call.timestamp).toLocaleTimeString() : "—"}</span></div>) : <div className="empty-state">No recorded sessions yet. Run an analysis to populate the archive.</div>}
    </div>
  </div>;
}

function SystemStatus() {
  return <div className="page-shell"><div className="analysis-head"><div><span className="eyebrow">NEXORA CORE / 05</span><h1>SYSTEM<br /><em>STATUS.</em></h1></div><span className="live-dot"><i /> ALL SYSTEMS NOMINAL</span></div>
    <div className="status-grid">{["API Gateway", "Speaker Verification", "Audio Forensics", "NLP Engine", "Risk Engine", "Security Response"].map((name, i) => <div className="status-card" key={name}><div><span className="status-check">✓</span><h3>{name}</h3></div><strong>ONLINE</strong><small>latency {12 + i * 3}ms</small></div>)}</div>
  </div>;
}

export default function App() {
  const [active, setActive] = useState("overview");
  const [menu, setMenu] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [calls, setCalls] = useState([]);
  const [alerts, setAlerts] = useState(0);

  async function refresh() {
    try {
      const [callsRes, alertsRes] = await Promise.all([
        api("/calls"),
        api("/alerts?status=ACTIVE"),
      ]);
      setCalls(Array.isArray(callsRes?.data) ? callsRes.data : []);
      setAlerts(Array.isArray(alertsRes?.data) ? alertsRes.data.length : 0);
    } catch {
      // The console remains usable in demo mode when the backend is unavailable.
    }
  }

  useEffect(() => { refresh(); }, []);

  const page = useMemo(() => {
    const names = { overview: "Overview", analysis: "Live Analysis", history: "History", system: "System", architecture: "Detection Stack" };
    return names[active] || "Overview";
  }, [active]);

  return (
    <div className="app">
      <div className="noise" />
      <Sidebar active={active} setActive={setActive} open={menu} setOpen={setMenu} />
      <div className="main">
        <Topbar page={page} onMenu={() => setMenu(true)} alertCount={alerts} />
        {active === "overview" && <Overview setActive={setActive} analysis={analysis} calls={calls} alerts={alerts} />}
        {active === "analysis" && <LiveAnalysis analysis={analysis} setAnalysis={setAnalysis} onComplete={() => refresh()} />}
        {active === "architecture" && <Architecture />}
        {active === "history" && <History calls={calls} />}
        {active === "system" && <SystemStatus />}
      </div>
    </div>
  );
}
