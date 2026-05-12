const fs   = require('fs');
const path = require('path');

function fmt(ms) {
  const s   = Math.floor(ms / 1000);
  const h   = Math.floor(s / 3600);
  const m   = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

function fmtDate(iso) {
  const [y, mo, d] = iso.split('-').map(Number);
  return new Date(y, mo - 1, d).toLocaleDateString('en-CA', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });
}

function writeMarkdown(sessions, categories) {
  const vault = process.env.VAULT_ROOT;
  if (!vault) return;

  const labelMap = Object.fromEntries(categories.map(c => [c.id, c.label]));
  const entries  = Object.entries(sessions)
    .sort((a, b) => (b[1].total ?? 0) - (a[1].total ?? 0));

  const lines = [
    '# Time Tracking',
    '',
    `*Last updated: ${new Date().toLocaleString()}*`,
    '',
  ];

  for (const [id, { total = 0, days = {} }] of entries) {
    const label     = labelMap[id] ?? id;
    const sortedDays = Object.entries(days).sort(([a], [b]) => b.localeCompare(a));

    lines.push(`## ${label}`);
    lines.push('');
    lines.push(`| Date | Duration |`);
    lines.push(`| ---- | -------- |`);

    for (const [date, ms] of sortedDays) {
      lines.push(`| ${fmtDate(date)} | ${fmt(ms)} |`);
    }

    lines.push(`| **Total** | **${fmt(total)}** |`);
    lines.push('');
  }

  try {
    fs.writeFileSync(path.join(vault, 'Time Tracking.md'), lines.join('\n'), 'utf8');
  } catch (err) {
    console.error('Failed to write Time Tracking.md:', err.message);
  }
}

module.exports = { writeMarkdown };
