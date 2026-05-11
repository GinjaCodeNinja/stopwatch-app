const fs   = require('fs');
const path = require('path');

const HEADING_RE = /^#\s+(.+)/m;

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function scanProjects(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .flatMap(dir => {
      const readmePath = path.join(root, dir.name, 'README.md');
      if (!fs.existsSync(readmePath)) return [];
      const content = fs.readFileSync(readmePath, 'utf8');
      const match   = content.match(HEADING_RE);
      const label   = match ? match[1].trim() : dir.name;
      return [{ id: slugify(dir.name), label, source: 'readme' }];
    });
}

const MANUAL = [
  { id: 'todos',    label: 'Todos',    source: 'manual' },
  { id: 'meetings', label: 'Meetings', source: 'manual' },
];

module.exports = { scanProjects, MANUAL };
