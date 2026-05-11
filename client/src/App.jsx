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
    try {
      const cfg = await fetchConfig();
      if (!cfg.configured) {
        setDefaultPath(cfg.defaultPath ?? '');
        setAppState('setup');
        return;
      }
      const [cats, sessions] = await Promise.all([fetchCategories(), fetchSessions()]);
      setCategories(cats);
      init(cats, sessions); // pass cats directly — avoids stale closure on categories state
      setAppState('ready');
    } catch (err) {
      console.error('Bootstrap failed:', err);
      setAppState('error');
    }
  };

  useEffect(() => { bootstrap(); }, []);

  if (appState === 'loading') {
    return <div className="app-loading"><span>Loading…</span></div>;
  }

  if (appState === 'error') {
    return (
      <div className="app-loading">
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#ef4444', marginBottom: '1rem' }}>
            Could not connect to the server. Is it running on port 3001?
          </p>
          <button onClick={bootstrap} style={{ padding: '0.5rem 1.5rem', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      </div>
    );
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
