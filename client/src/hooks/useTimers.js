import { useRef, useState, useEffect, useCallback } from 'react';
import { patchSession } from '../api';

export function useTimers(categories) {
  const [state, setState] = useState({});
  const tickRef = useRef(null);

  // Accept cats explicitly so callers don't depend on stale closed-over categories
  const init = useCallback((cats, totals) => {
    setState(
      Object.fromEntries(
        cats.map(c => [c.id, {
          cumulative:     totals[c.id] ?? 0,
          sessionStart:   null,
          sessionElapsed: 0,
        }])
      )
    );
  }, []);

  useEffect(() => {
    tickRef.current = setInterval(() => {
      setState(prev => {
        const hasRunning = Object.values(prev).some(t => t.sessionStart);
        if (!hasRunning) return prev;
        const next = { ...prev };
        for (const id in next) {
          if (next[id].sessionStart) {
            next[id] = { ...next[id], sessionElapsed: Date.now() - next[id].sessionStart };
          }
        }
        return next;
      });
    }, 500);
    return () => clearInterval(tickRef.current);
  }, []);

  const stopTimer = useCallback((id, prevState) => {
    const t = prevState[id];
    if (!t?.sessionStart) return prevState;
    const elapsed = Date.now() - t.sessionStart;
    patchSession(id, elapsed);
    return {
      ...prevState,
      [id]: { cumulative: t.cumulative + elapsed, sessionStart: null, sessionElapsed: 0 },
    };
  }, []);

  const startTimer = useCallback((id) => {
    setState(prev => {
      let next = { ...prev };
      // Stop any running timer first (exclusive behavior)
      for (const tid in next) {
        if (next[tid].sessionStart) next = stopTimer(tid, next);
      }
      next[id] = { ...next[id], sessionStart: Date.now(), sessionElapsed: 0 };
      return next;
    });
  }, [stopTimer]);

  const toggleTimer = useCallback((id) => {
    setState(prev =>
      prev[id]?.sessionStart
        ? stopTimer(id, prev)
        : (startTimer(id), prev)
    );
  }, [startTimer, stopTimer]);

  return { state, init, toggleTimer };
}
