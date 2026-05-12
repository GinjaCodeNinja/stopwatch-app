import { useEffect, useState } from 'react';
import { fetchHistory } from '../api';

function fmt(ms) {
  const s   = Math.floor(ms / 1000);
  const h   = Math.floor(s / 3600);
  const m   = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

function fmtDate(iso) {
  const [y, m, d] = iso.split('-');
  return new Date(+y, +m - 1, +d).toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function HistoryPanel({ onClose }) {
  const [history, setHistory] = useState(null);

  useEffect(() => {
    fetchHistory().then(setHistory).catch(console.error);
  }, []);

  const entries = history
    ? Object.entries(history).sort((a, b) => (b[1].total ?? 0) - (a[1].total ?? 0))
    : [];

  return (
    <div className="history-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="history-panel">
        <div className="history-header">
          <h2>Time History</h2>
          <button className="history-close" onClick={onClose}>✕</button>
        </div>

        <div className="history-body">
          {history === null && <p className="history-empty">Loading…</p>}
          {history !== null && entries.length === 0 && (
            <p className="history-empty">No history yet. Start a timer to begin tracking.</p>
          )}

          {entries.map(([id, { label, total, days }]) => {
            const sortedDays = Object.entries(days)
              .sort(([a], [b]) => b.localeCompare(a)); // most recent first

            return (
              <div key={id} className="history-project">
                <div className="history-project-header">
                  <span className="history-project-name">{label}</span>
                  <span className="history-project-total">{fmt(total)}</span>
                </div>
                <div className="history-days">
                  {sortedDays.map(([date, ms]) => (
                    <div key={date} className="history-day-row">
                      <span className="history-day-date">{fmtDate(date)}</span>
                      <span className="history-day-time">{fmt(ms)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
