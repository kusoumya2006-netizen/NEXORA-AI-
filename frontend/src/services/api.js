const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return await res.json();
}

export async function fetchDashboardSummary() {
  const res = await fetch(`${API_BASE}/dashboard/summary`);
  return await res.json();
}

export async function fetchCalls() {
  const res = await fetch(`${API_BASE}/calls`);
  return await res.json();
}

export async function fetchCallDetail(callId) {
  const res = await fetch(`${API_BASE}/calls/${callId}`);
  return await res.json();
}

export async function fetchAlerts(severity, status) {
  let url = `${API_BASE}/alerts`;
  const params = new URLSearchParams();
  if (severity) params.append('severity', severity);
  if (status) params.append('status', status);
  if (params.toString()) url += `?${params.toString()}`;

  const res = await fetch(url);
  return await res.json();
}

export async function fetchAuditLogs() {
  const res = await fetch(`${API_BASE}/audit-logs`);
  return await res.json();
}

export async function triggerAnalyze(payload) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await res.json();
}

export async function triggerSecurityResponse(callId, riskLevel) {
  const res = await fetch(`${API_BASE}/security/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      call_id: callId,
      risk_level: riskLevel
    })
  });
  return await res.json();
}

export async function triggerAnalyzeFormData(formData) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    body: formData
  });
  return await res.json();
}
