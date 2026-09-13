"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { dailyCapReached, remainingRestriction, remainingVault, setSeverity, startRestriction, startVault, tickUsage } from "@/lib/engine";
import { defaultState, expireLocks, type AppState } from "@/lib/state";
import { getProfileId, loadState, saveState, setProfileId, type SyncStatus } from "@/lib/persist";

type Ctx = {
  state: AppState;
  now: number;
  ready: boolean;
  storeWarning: string | null;
  syncStatus: SyncStatus;
  profileId: string;
  persistLabel: string;
  freeze: boolean;
  capReached: boolean;
  restrictionLeft: number;
  vaultLeft: number;
  engageRestriction: (days: number) => void;
  engageVault: (days: number, dailyCapMinutes: number | null) => void;
  changeSeverity: (value: number) => void;
  restoreProfile: (id: string) => Promise<boolean>;
};

const AntipornContext = createContext<Ctx | null>(null);

export function AntipornProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [now, setNow] = useState(() => Date.now());
  const [ready, setReady] = useState(false);
  const [storeWarning, setStoreWarning] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("loading");
  const [profileId, setProfile] = useState("");
  const [persistLabel, setPersistLabel] = useState("Cloud Run API");
  const lastLockRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadState().then((loaded) => {
      if (!cancelled) {
        setState(loaded.state);
        setStoreWarning(loaded.warning);
        setProfile(loaded.profileId);
        setSyncStatus(loaded.remote ? "saved" : loaded.warning ? "error" : "local");
        setReady(true);
      }
    });
    fetch("/api/health")
      .then((res) => res.json())
      .then((info: { persist?: string; project?: string }) => {
        if (cancelled) return;
        const persist = info.persist ?? "gcp";
        setPersistLabel(
          persist === "local"
            ? "Cloud Run API (local store)"
            : persist === "gcs"
              ? "GCS locks in devo-holding"
              : persist === "firestore"
                ? "Firestore in devo-holding"
                : "Cloud Run API in devo-holding",
        );
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const lockKey = [
      state.restriction.active,
      state.restriction.endsAt,
      state.vault.active,
      state.vault.endsAt,
      state.severity,
    ].join(":");
    const lockChanged = lastLockRef.current !== null && lastLockRef.current !== lockKey;
    lastLockRef.current = lockKey;
    void saveState(state, { immediate: lockChanged }).then((result) => {
      setStoreWarning(result.warning);
      setSyncStatus(result.status);
    });
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

  const restoreProfile = useCallback(async (id: string) => {
    if (!setProfileId(id)) return false;
    setReady(false);
    setSyncStatus("loading");
    const loaded = await loadState();
    setState(loaded.state);
    setStoreWarning(loaded.warning);
    setProfile(loaded.profileId);
    setSyncStatus(loaded.remote ? "saved" : loaded.warning ? "error" : "local");
    setReady(true);
    return true;
  }, []);

  const freeze = state.restriction.active || state.vault.active;
  const capReached = dailyCapReached(state);

  const value = useMemo<Ctx>(
    () => ({
      state,
      now,
      ready,
      storeWarning,
      syncStatus,
      profileId: profileId || getProfileId(),
      persistLabel,
      freeze,
      capReached,
      restrictionLeft: remainingRestriction(state, now),
      vaultLeft: remainingVault(state, now),
      engageRestriction,
      engageVault,
      changeSeverity,
      restoreProfile,
    }),
    [
      state,
      now,
      ready,
      storeWarning,
      syncStatus,
      profileId,
      persistLabel,
      freeze,
      capReached,
      engageRestriction,
      engageVault,
      changeSeverity,
      restoreProfile,
    ],
  );

  return <AntipornContext.Provider value={value}>{children}</AntipornContext.Provider>;
}

export function useAntiporn() {
  const ctx = useContext(AntipornContext);
  if (!ctx) throw new Error("useAntiporn must be used inside AntipornProvider");
  return ctx;
}
