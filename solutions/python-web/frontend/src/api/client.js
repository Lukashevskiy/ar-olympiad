const API_BASE = 'http://localhost:8000';

export async function getHealth() {
  const response = await fetch(`${API_BASE}/health`);
  return response.json();
}

export async function detectObject(payload) {
  const response = await fetch(`${API_BASE}/api/detect/object`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return response.json();
}

export async function projectShadow(payload) {
  const response = await fetch(`${API_BASE}/api/project/shadow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return response.json();
}
