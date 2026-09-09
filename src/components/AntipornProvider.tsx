"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { dailyCapReached, remainingRestriction, remainingVault, setSeverity, startRestriction, startVault, tickUsage } from "@/lib/engine";
import { defaultState, expireLocks, type AppState } from "@/lib/state";
import { loadState, saveState } from "@/lib/persist";

type Ctx = {
  state: AppState;
  now: number;
  ready: boolean;
  freeze: boolean;
  capReached: boolean;
  restrictionLeft: number;
  vaultLeft: number;
  engageRestriction: (days: number) => void;
  engageVault: (days: number, dailyCapMinutes: number | null) => void;
  changeSeverity: (value: number) => void;
};

const AntipornContext = createContext<Ctx | null>(null);

export function AntipornProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [now, setNow] = useState(() => Date.now());
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    let cancelled = false;
    loadState().then((loaded) => {
      if (!cancelled) {
        setState(loaded);
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    void saveState(state);
  }, [state, ready]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      setState((prev) => tickUsage(prev, 1000, document.visibilityState === "visible", t));
    }, 1000);
    const onVis = () => {
      const t = Date.now();
      setNow(t);
      setState((prev) => tickUsage(prev, 0, document.visibilityState === "visible", t));
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const engageRestriction = useCallback((days: number) => {
    setState((prev) => startRestriction(expireLocks(prev), days));
  }, []);

  const engageVault = useCallback((days: number, dailyCapMinutes: number | null) => {
    setState((prev) => startVault(expireLocks(prev), days, dailyCapMinutes));
  }, []);

  const changeSeverity = useCallback((value: number) => {
    setState((prev) => setSeverity(prev, value));
  }, []);

  const freeze = state.restriction.active || state.vault.active;
  const capReached = dailyCapReached(state);

  const value = useMemo<Ctx>(
    () => ({
      state,
      now,
      ready,
      freeze,
      capReached,
      restrictionLeft: remainingRestriction(state, now),
      vaultLeft: remainingVault(state, now),
      engageRestriction,
      engageVault,
      changeSeverity,
    }),
    [state, now, ready, freeze, capReached, engageRestriction, engageVault, changeSeverity],
  );

  return <AntipornContext.Provider value={value}>{children}</AntipornContext.Provider>;
}

export function useAntiporn() {
  const ctx = useContext(AntipornContext);
  if (!ctx) throw new Error("useAntiporn must be used inside AntipornProvider");
  return ctx;
}
