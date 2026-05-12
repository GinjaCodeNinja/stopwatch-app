import { useEffect, useState } from 'react';
import { FirstRunSetup } from './components/FirstRunSetup';
import { TimerGrid }     from './components/TimerGrid';
import { HistoryPanel }  from './components/HistoryPanel';
import { useTimers }     from './hooks/useTimers';
import { fetchConfig, fetchCategories, fetchSessions, fetchRunning } from './api';

export default function App() {
  const [appState,    setAppState]    = useState('loading');
  const [vaultPath,   setVaultPath]   = useState('');
  const [categories,  setCategories]  = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const { state: timerState, init, toggleTimer, resetTimer } = useTimers(categories);

  const bootstrap = async () => {
    setAppState('loading');
    try {
      const cfg = await fetchConfig();
      if (!cfg.configured) {
        setVaultPath(cfg.vaultRoot ?? '');
        setAppState('setup');
        return;
      }
      const [cats, sessions, running] = await Promise.all([
        fetchCategories(),
        fetchSessions(),
        fetchRunning(),
      ]);
      setCategories(cats);
      init(cats, sessions, running);
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
    return <FirstRunSetup currentVaultPath={vaultPath} onComplete={bootstrap} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Project Timers</h1>
        <div className="header-actions">
          <button className="history-btn" onClick={() => setShowHistory(true)}>📊 History</button>
          <button className="settings-btn" onClick={() => setAppState('setup')}>⚙ Settings</button>
        </div>
      </header>
      <TimerGrid categories={categories} timerState={timerState} onToggle={toggleTimer} onReset={resetTimer} />
      {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}
    </div>
  );
}
