const fs   = require('fs');
const path = require('path');

const CONFIG_FILE  = path.join(__dirname, '../data/config.json');
const DEFAULT_PATH = 'C:\\Users\\bsalter\\OneDrive - NCI Northern Computer Inc\\Desktop\\Re-Brenden';

function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  return { projectsRoot: null, configured: false };
}

function saveConfig(data) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
}

module.exports = { loadConfig, saveConfig, DEFAULT_PATH };
