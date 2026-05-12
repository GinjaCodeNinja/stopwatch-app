require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const fs      = require('fs');
const { scanProjects, MANUAL } = require('./readmeParser');
const { loadSessions, saveSessions } = require('./storage');
const { loadConfig, writeEnv } = require('./config');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/api/config', (_req, res) => {
  res.json(loadConfig());
});

app.post('/api/config', (req, res) => {
  const { vaultRoot, projectsRoot } = req.body;
  if (!vaultRoot || !projectsRoot) {
    return res.status(400).json({ error: 'vaultRoot and projectsRoot are required' });
  }
  if (!fs.existsSync(projectsRoot)) {
    return res.status(422).json({ error: `Path not found: ${projectsRoot}` });
  }
  writeEnv({ VAULT_ROOT: vaultRoot, PROJECTS_ROOT: projectsRoot });
  res.json({ ok: true });
});

// List immediate subfolders of a given path (used by setup step 2)
app.get('/api/folders', (req, res) => {
  const { path: dirPath } = req.query;
  if (!dirPath) return res.status(400).json({ error: 'path query param required' });
  if (!fs.existsSync(dirPath)) {
    return res.status(422).json({ error: `Path not found: ${dirPath}` });
  }
  const folders = fs.readdirSync(dirPath, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort((a, b) => a.localeCompare(b));
  res.json(folders);
});

app.get('/api/categories', (_req, res) => {
  const { projectsRoot, configured } = loadConfig();
  if (!configured) return res.status(428).json({ error: 'not_configured' });
  res.json([...MANUAL, ...scanProjects(projectsRoot)]);
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

app.delete('/api/sessions/:id', (req, res) => {
  const sessions = loadSessions();
  delete sessions[req.params.id];
  saveSessions(sessions);
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
