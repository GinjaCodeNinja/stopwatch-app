const express  = require('express');
const { scanProjects, MANUAL } = require('./readmeParser');
const { loadSessions, saveSessions } = require('./storage');
const { loadConfig, saveConfig, DEFAULT_PATH } = require('./config');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/api/config', (_req, res) => {
  const cfg = loadConfig();
  res.json({ ...cfg, defaultPath: DEFAULT_PATH });
});

app.post('/api/config', (req, res) => {
  const { projectsRoot } = req.body;
  if (!projectsRoot) return res.status(400).json({ error: 'projectsRoot is required' });

  const fs = require('fs');
  if (!fs.existsSync(projectsRoot)) {
    return res.status(422).json({ error: `Path not found: ${projectsRoot}` });
  }

  saveConfig({ projectsRoot, configured: true });
  res.json({ ok: true });
});

app.get('/api/categories', (_req, res) => {
  const { projectsRoot, configured } = loadConfig();
  if (!configured) return res.status(428).json({ error: 'not_configured' });

  const readme = scanProjects(projectsRoot);
  res.json([...MANUAL, ...readme]);
});

app.get('/api/sessions', (_req, res) => {
  res.json(loadSessions());
});

app.patch('/api/sessions/:id', (req, res) => {
  const { elapsed } = req.body;
  if (typeof elapsed !== 'number') return res.status(400).json({ error: 'elapsed (ms) required' });

  const sessions = loadSessions();
  sessions[req.params.id] = (sessions[req.params.id] ?? 0) + elapsed;
  saveSessions(sessions);
  res.json({ total: sessions[req.params.id] });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
