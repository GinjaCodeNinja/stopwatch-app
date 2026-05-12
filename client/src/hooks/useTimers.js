import { useRef, useState, useEffect, useCallback } from 'react';
import { patchSession, deleteSession } from '../api';

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

  const toggleTimer = useCallback((id) => {
    setState(prev => {
      const t = prev[id];
      if (t?.sessionStart) {
        // Stop this timer
        const elapsed = Date.now() - t.sessionStart;
        patchSession(id, elapsed);
        return {
          ...prev,
          [id]: { cumulative: t.cumulative + elapsed, sessionStart: null, sessionElapsed: 0 },
        };
      }
      // Start this timer — stop any other running timer first
      let next = { ...prev };
      for (const tid in next) {
        if (next[tid].sessionStart) {
          const elapsed = Date.now() - next[tid].sessionStart;
          patchSession(tid, elapsed);
          next[tid] = { cumulative: next[tid].cumulative + elapsed, sessionStart: null, sessionElapsed: 0 };
        }
      }
      next[id] = { ...next[id], sessionStart: Date.now(), sessionElapsed: 0 };
      return next;
    });
  }, []);

  const resetTimer = useCallback((id) => {
    deleteSession(id);
    setState(prev => ({
      ...prev,
      [id]: { cumulative: 0, sessionStart: null, sessionElapsed: 0 },
    }));
  }, []);

  return { state, init, toggleTimer, resetTimer };
}
