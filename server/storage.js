const fs   = require('fs');
const path = require('path');

// All data lives inside {VAULT_ROOT}/.timers/ so it syncs via OneDrive/cloud
function getDataDir() {
  const vault = process.env.VAULT_ROOT;
  if (!vault) throw new Error('VAULT_ROOT not set — run setup first');
  const dir = path.join(vault, '.timers');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const sessionsPath = () => path.join(getDataDir(), 'sessions.json');
const runningPath  = () => path.join(getDataDir(), 'running.json');

function loadSessions() {
  const f = sessionsPath();
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
}

function saveSessions(data) {
  fs.writeFileSync(sessionsPath(), JSON.stringify(data, null, 2));
}

function getTotals() {
  const sessions = loadSessions();
  return Object.fromEntries(
    Object.entries(sessions).map(([id, v]) => [id, v.total ?? 0])
  );
}

function addElapsed(id, elapsed) {
  const sessions = loadSessions();
  if (!sessions[id]) sessions[id] = { total: 0, days: {} };
  const today = new Date().toISOString().slice(0, 10);
  sessions[id].total          = (sessions[id].total ?? 0) + elapsed;
  sessions[id].days           = sessions[id].days ?? {};
  sessions[id].days[today]    = (sessions[id].days[today] ?? 0) + elapsed;
  saveSessions(sessions);
  return sessions[id].total;
}

function resetSession(id) {
  const sessions = loadSessions();
  delete sessions[id];
  saveSessions(sessions);
}

function loadRunning() {
  try {
    const f = runningPath();
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
  } catch { return null; }
}

function saveRunning(data) {
  if (data === null) {
    try { fs.unlinkSync(runningPath()); } catch {}
  } else {
    fs.writeFileSync(runningPath(), JSON.stringify(data, null, 2));
  }
}

module.exports = { loadSessions, saveSessions, getTotals, addElapsed, resetSession, loadRunning, saveRunning };
