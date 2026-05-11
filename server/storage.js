const fs   = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '../data/sessions.json');

const loadSessions = () =>
  fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : {};

const saveSessions = data =>
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

module.exports = { loadSessions, saveSessions };
