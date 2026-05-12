import { TimerCard } from './TimerCard';

export function TimerGrid({ categories, timerState, onToggle, onReset }) {
  const manual   = categories.filter(c => c.source === 'manual');
  const projects = categories.filter(c => c.source === 'project');

  const renderCards = (cats) => cats.map(cat => (
    <TimerCard
      key={cat.id}
      category={cat}
      timerState={timerState[cat.id]}
      onToggle={onToggle}
      onReset={onReset}
    />
  ));

  return (
    <div className="timer-sections">
      {manual.length > 0 && (
        <section className="timer-section">
          <h2 className="section-heading">General</h2>
          <div className="timer-grid">{renderCards(manual)}</div>
        </section>
      )}
      {projects.length > 0 && (
        <section className="timer-section">
          <h2 className="section-heading">Projects</h2>
          <div className="timer-grid">{renderCards(projects)}</div>
        </section>
      )}
    </div>
  );
}
