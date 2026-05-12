import { useState } from 'react';
import { fetchFolders, saveConfig } from '../api';

export function FirstRunSetup({ currentVaultPath, onComplete }) {
  const [step,        setStep]        = useState(1);
  const [vaultPath,   setVaultPath]   = useState(currentVaultPath ?? '');
  const [folders,     setFolders]     = useState([]);
  const [selected,    setSelected]    = useState(null);
  const [error,       setError]       = useState(null);
  const [loading,     setLoading]     = useState(false);

  const browseVault = async () => {
    if (!window.showDirectoryPicker) return;
    try {
      const handle = await window.showDirectoryPicker();
      // showDirectoryPicker only gives us the folder name, not the full path.
      // Replace the last segment of the current typed path with the picked name.
      setVaultPath(prev => {
        if (!prev) return handle.name;
        const sep   = prev.includes('\\') ? '\\' : '/';
        const parts = prev.split(/[\\/]/);
        parts[parts.length - 1] = handle.name;
        return parts.join(sep);
      });
    } catch {} // user cancelled
  };

  const handleVaultNext = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const list = await fetchFolders(vaultPath.trim());
      setFolders(list);
      setSelected(null);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    const projectsRoot = vaultPath.trim().replace(/[\\/]+$/, '') + '\\' + selected;
    try {
      await saveConfig(vaultPath.trim(), projectsRoot);
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

        {step === 1 && (
          <>
            <p>Select your root folder on this device. You'll choose the projects subfolder next.</p>
            <form onSubmit={handleVaultNext}>
              <label htmlFor="vault-path">Vault folder</label>
              <div className="path-input-row">
                <input
                  id="vault-path"
                  type="text"
                  value={vaultPath}
                  onChange={e => setVaultPath(e.target.value)}
                  placeholder="C:\Users\you\ObsidianVault"
                  spellCheck={false}
                  autoComplete="off"
                />
                {window.showDirectoryPicker && (
                  <button type="button" className="browse-btn" onClick={browseVault}>
                    Browse…
                  </button>
                )}
              </div>
              {error && <p className="setup-error">{error}</p>}
              <button type="submit" className="setup-submit" disabled={!vaultPath.trim() || loading}>
                {loading ? 'Reading folders…' : 'Next →'}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <p>
              Which folder inside <code>{vaultPath.split(/[\\/]/).pop()}</code> contains your projects?
            </p>
            <div className="folder-grid">
              {folders.map(f => (
                <button
                  key={f}
                  className={`folder-btn${selected === f ? ' selected' : ''}`}
                  onClick={() => setSelected(f)}
                >
                  📁 {f}
                </button>
              ))}
            </div>
            {error && <p className="setup-error">{error}</p>}
            <div className="setup-actions">
              <button className="back-btn" onClick={() => { setStep(1); setError(null); }}>
                ← Back
              </button>
              <button className="setup-submit" disabled={!selected || loading} onClick={handleSave}>
                {loading ? 'Saving…' : 'Save & Continue'}
              </button>
            </div>
          </>
        )}

        <p className="setup-hint">You can change this later via ⚙ Settings.</p>
      </div>
    </div>
  );
}
