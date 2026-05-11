import { useEffect, useState } from 'react';
import { FirstRunSetup } from './components/FirstRunSetup';
import { TimerGrid }     from './components/TimerGrid';
import { useTimers }     from './hooks/useTimers';
import { fetchConfig, fetchCategories, fetchSessions } from './api';

export default function App() {
  const [appState,    setAppState]    = useState('loading'); // loading | setup | ready
  const [defaultPath, setDefaultPath] = useState('');
  const [categories,  setCategories]  = useState([]);
  const { state: timerState, init, toggleTimer } = useTimers(categories);

  const bootstrap = async () => {
    setAppState('loading');
    const cfg = await fetchConfig();
    if (!cfg.configured) {
      setDefaultPath(cfg.defaultPath ?? '');
      setAppState('setup');
      return;
    }
    const [cats, sessions] = await Promise.all([fetchCategories(), fetchSessions()]);
    setCategories(cats);
    init(sessions);
    setAppState('ready');
  };

  useEffect(() => { bootstrap(); }, []);

  if (appState === 'loading') {
    return <div className="app-loading"><span>Loading…</span></div>;
  }

  if (appState === 'setup') {
    return <FirstRunSetup defaultPath={defaultPath} onComplete={bootstrap} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Project Timers</h1>
        <button className="settings-btn" onClick={() => setAppState('setup')}>⚙ Settings</button>
      </header>
      <TimerGrid categories={categories} timerState={timerState} onToggle={toggleTimer} />
    </div>
  );
}
