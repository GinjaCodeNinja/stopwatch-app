const fs   = require('fs');
const path = require('path');

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function scanProjects(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.includes('(PROJECT TEMPLATE)'))
    .map(dir => ({ id: slugify(dir.name), label: dir.name, source: 'project' }));
}

const MANUAL = [
  { id: 'todos',    label: 'Todos',    source: 'manual' },
  { id: 'meetings', label: 'Meetings', source: 'manual' },
];

module.exports = { scanProjects, MANUAL };
