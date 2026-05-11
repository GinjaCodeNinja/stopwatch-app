function fmt(ms) {
  const s   = Math.floor(ms / 1000);
  const h   = Math.floor(s / 3600);
  const m   = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

export function TimerCard({ category, timerState, onToggle }) {
  const { cumulative = 0, sessionStart, sessionElapsed = 0 } = timerState ?? {};
  const isRunning      = !!sessionStart;
  const totalDisplay   = fmt(cumulative + (isRunning ? sessionElapsed : 0));
  const sessionDisplay = fmt(isRunning ? sessionElapsed : 0);

  return (
    <div className={`timer-card${isRunning ? ' running' : ''}`}>
      <div className="timer-source">{category.source}</div>
      <h3 className="timer-label">{category.label}</h3>
      <div className="timer-cumulative" title="Total all-time">{totalDisplay}</div>
      <div className="timer-session"   title="This session">{sessionDisplay}</div>
      <button className="timer-toggle" onClick={() => onToggle(category.id)}>
        {isRunning ? '⏹ Stop' : '▶ Start'}
      </button>
    </div>
  );
}
