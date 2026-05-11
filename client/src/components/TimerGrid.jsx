import { TimerCard } from './TimerCard';

export function TimerGrid({ categories, timerState, onToggle }) {
  return (
    <div className="timer-grid">
      {categories.map(cat => (
        <TimerCard
          key={cat.id}
          category={cat}
          timerState={timerState[cat.id]}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
