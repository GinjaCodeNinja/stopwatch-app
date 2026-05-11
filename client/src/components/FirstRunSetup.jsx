import { useState } from 'react';
import { saveConfig } from '../api';

export function FirstRunSetup({ defaultPath, onComplete }) {
  const [path, setPath]     = useState(defaultPath ?? '');
  const [error, setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  const browsePath = async () => {
    if (!window.showDirectoryPicker) return;
    try {
      const handle = await window.showDirectoryPicker();
      setPath(prev => {
        const sep   = prev.includes('\\') ? '\\' : '/';
        const parts = prev.split(/[\\/]/);
        parts[parts.length - 1] = handle.name;
        return parts.join(sep);
      });
    } catch {} // user cancelled
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await saveConfig(path.trim());
      onComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-overlay">
      <div className="setup-card">
        <h1>Project Timers</h1>
        <p>
          Point this app at a folder containing project subfolders with{' '}
          <code>README.md</code> files. Each subfolder becomes a timer category.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="proj-path">Projects folder path</label>
          <div className="path-input-row">
            <input
              id="proj-path"
              type="text"
              value={path}
              onChange={e => setPath(e.target.value)}
              placeholder="C:\Users\you\projects"
              spellCheck={false}
              autoComplete="off"
            />
            {window.showDirectoryPicker && (
              <button type="button" className="browse-btn" onClick={browsePath}>
                Browse…
              </button>
            )}
          </div>

          {error && <p className="setup-error">{error}</p>}

          <button type="submit" className="setup-submit" disabled={!path.trim() || loading}>
            {loading ? 'Checking…' : 'Save & Continue'}
          </button>
        </form>

        <p className="setup-hint">You can change this later via ⚙ Settings.</p>
      </div>
    </div>
  );
}
