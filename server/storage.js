const fs   = require('fs');
const path = require('path');

const SESSIONS_FILE = path.join(__dirname, '../data/sessions.json');
const RUNNING_FILE  = path.join(__dirname, '../data/running.json');

function loadSessions() {
  if (!fs.existsSync(SESSIONS_FILE)) return {};
  return JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
}

function saveSessions(data) {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(data, null, 2));
}

// Returns { [id]: totalMs } for client init (backward compat shape)
function getTotals() {
  const sessions = loadSessions();
  return Object.fromEntries(
    Object.entries(sessions).map(([id, v]) => [id, v.total ?? 0])
  );
}

// Adds elapsed to both total and today's date bucket
function addElapsed(id, elapsed) {
  const sessions = loadSessions();
  if (!sessions[id]) sessions[id] = { total: 0, days: {} };
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  sessions[id].total = (sessions[id].total ?? 0) + elapsed;
  sessions[id].days  = sessions[id].days ?? {};
  sessions[id].days[today] = (sessions[id].days[today] ?? 0) + elapsed;
  saveSessions(sessions);
  return sessions[id].total;
}

function resetSession(id) {
  const sessions = loadSessions();
  delete sessions[id];
  saveSessions(sessions);
}

// Running checkpoint — persists the active timer across restarts
function loadRunning() {
  if (!fs.existsSync(RUNNING_FILE)) return null;
  try { return JSON.parse(fs.readFileSync(RUNNING_FILE, 'utf8')); }
  catch { return null; }
}

function saveRunning(data) {
  if (data === null) {
    if (fs.existsSync(RUNNING_FILE)) fs.unlinkSync(RUNNING_FILE);
  } else {
    fs.writeFileSync(RUNNING_FILE, JSON.stringify(data, null, 2));
  }
}

module.exports = { loadSessions, getTotals, addElapsed, resetSession, loadRunning, saveRunning };
