export const fetchConfig     = () => fetch('/api/config').then(r => r.json());
export const fetchCategories = () => fetch('/api/categories').then(r => r.json());
export const fetchSessions   = () => fetch('/api/sessions').then(r => r.json());
export const fetchRunning    = () => fetch('/api/running').then(r => r.json());
export const fetchHistory    = () => fetch('/api/history').then(r => r.json());

export async function saveConfig(vaultRoot, projectsRoot) {
  const res  = await fetch('/api/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vaultRoot, projectsRoot }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function fetchFolders(path) {
  const res  = await fetch(`/api/folders?path=${encodeURIComponent(path)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export function startSession(id) {
  fetch(`/api/sessions/${id}/start`, { method: 'POST' }).catch(console.error);
}

export function patchSession(id, elapsed) {
  fetch(`/api/sessions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ elapsed }),
  }).catch(console.error);
}

export function deleteSession(id) {
  fetch(`/api/sessions/${id}`, { method: 'DELETE' }).catch(console.error);
}
