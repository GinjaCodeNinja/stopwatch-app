require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const fs      = require('fs');
const { scanProjects, MANUAL } = require('./readmeParser');
const { getTotals, addElapsed, resetSession, loadSessions, loadRunning, saveRunning } = require('./storage');
const { loadConfig, writeEnv } = require('./config');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// On startup: auto-finalize any session that was running when the server last stopped
(function recoverRunning() {
  const running = loadRunning();
  if (!running) return;
  const elapsed = Date.now() - new Date(running.startedAt).getTime();
  if (elapsed > 0) addElapsed(running.id, elapsed);
  saveRunning(null);
  console.log(`Recovered ${Math.round(elapsed / 1000)}s for "${running.id}" from previous session`);
})();

// ── Config ────────────────────────────────────────────────────────────────────

app.get('/api/config', (_req, res) => res.json(loadConfig()));

app.post('/api/config', (req, res) => {
  const { vaultRoot, projectsRoot } = req.body;
  if (!vaultRoot || !projectsRoot)
    return res.status(400).json({ error: 'vaultRoot and projectsRoot are required' });
  if (!fs.existsSync(projectsRoot))
    return res.status(422).json({ error: `Path not found: ${projectsRoot}` });
  writeEnv({ VAULT_ROOT: vaultRoot, PROJECTS_ROOT: projectsRoot });
  res.json({ ok: true });
});

// ── Folder browser (setup step 2) ─────────────────────────────────────────────

app.get('/api/folders', (req, res) => {
  const { path: dirPath } = req.query;
  if (!dirPath) return res.status(400).json({ error: 'path query param required' });
  if (!fs.existsSync(dirPath)) return res.status(422).json({ error: `Path not found: ${dirPath}` });
  const folders = fs.readdirSync(dirPath, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort((a, b) => a.localeCompare(b));
  res.json(folders);
});

// ── Categories ────────────────────────────────────────────────────────────────

app.get('/api/categories', (_req, res) => {
  const { projectsRoot, configured } = loadConfig();
  if (!configured) return res.status(428).json({ error: 'not_configured' });
  res.json([...MANUAL, ...scanProjects(projectsRoot)]);
});

// ── Sessions ──────────────────────────────────────────────────────────────────

app.get('/api/sessions', (_req, res) => res.json(getTotals()));

// Called when a timer starts — persists start time so recovery works
app.post('/api/sessions/:id/start', (req, res) => {
  saveRunning({ id: req.params.id, startedAt: new Date().toISOString() });
  res.json({ ok: true });
});

// Called when a timer stops — records elapsed + clears running checkpoint
app.patch('/api/sessions/:id', (req, res) => {
  const { elapsed } = req.body;
  if (typeof elapsed !== 'number') return res.status(400).json({ error: 'elapsed (ms) required' });
  const total = addElapsed(req.params.id, elapsed);
  saveRunning(null);
  res.json({ total });
});

app.delete('/api/sessions/:id', (req, res) => {
  resetSession(req.params.id);
  res.json({ ok: true });
});

// ── Running checkpoint (client restore on reload) ─────────────────────────────

app.get('/api/running', (_req, res) => res.json(loadRunning()));

// ── History ───────────────────────────────────────────────────────────────────

app.get('/api/history', (_req, res) => {
  const { projectsRoot, configured } = loadConfig();
  const categories = configured
    ? [...MANUAL, ...scanProjects(projectsRoot)]
    : MANUAL;

  const labelMap = Object.fromEntries(categories.map(c => [c.id, c.label]));
  const sessions = loadSessions();

  const history = Object.fromEntries(
    Object.entries(sessions).map(([id, v]) => [id, {
      label: labelMap[id] ?? id,
      total: v.total ?? 0,
      days:  v.days  ?? {},
    }])
  );

  res.json(history);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
