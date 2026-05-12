const fs   = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const ENV_FILE = path.join(__dirname, '../.env');

function readEnvFile() {
  if (!fs.existsSync(ENV_FILE)) return {};
  return Object.fromEntries(
    fs.readFileSync(ENV_FILE, 'utf8')
      .split('\n')
      .filter(line => line.includes('='))
      .map(line => {
        const idx = line.indexOf('=');
        return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
      })
  );
}

function writeEnv(updates) {
  const current = readEnvFile();
  const merged  = { ...current, ...updates };
  const content = Object.entries(merged).map(([k, v]) => `${k}=${v}`).join('\n') + '\n';
  fs.writeFileSync(ENV_FILE, content, 'utf8');
  // Apply immediately without restart
  for (const [k, v] of Object.entries(updates)) process.env[k] = v;
}

function loadConfig() {
  const vaultRoot    = process.env.VAULT_ROOT    ?? null;
  const projectsRoot = process.env.PROJECTS_ROOT ?? null;
  return { vaultRoot, projectsRoot, configured: !!(vaultRoot && projectsRoot) };
}

module.exports = { loadConfig, writeEnv };
