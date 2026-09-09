import { todayKey } from "./utils";

export const STORAGE_KEY = "antiporn.v1.state";
export const STORAGE_MIRROR_KEY = "antiporn.v1.mirror";
export const IDB_NAME = "antiporn";
export const IDB_STORE = "locks";

export const MAX_RESTRICTION_DAYS = 30;
export const MAX_VAULT_DAYS = 7;
export const MAX_DAILY_CAP_HOURS = 16;

export type DeviceRestriction = {
  active: boolean;
  startedAt: number;
  endsAt: number;
  days: number;
};

export type TimeVault = {
  active: boolean;
  startedAt: number;
  endsAt: number;
  days: number;
  dailyCapMinutes: number | null;
};

export type UsageDay = {
  dayKey: string;
  usedMs: number;
  lastVisibleAt: number | null;
};

export type AppState = {
  version: 1;
  severity: number;
  restriction: DeviceRestriction;
  vault: TimeVault;
  usage: UsageDay;
  createdAt: number;
};

export function defaultState(now = Date.now()): AppState {
  return {
    version: 1,
    severity: 35,
    restriction: {
      active: false,
      startedAt: 0,
      endsAt: 0,
      days: 7,
    },
    vault: {
      active: false,
      startedAt: 0,
      endsAt: 0,
      days: 1,
      dailyCapMinutes: 180,
    },
    usage: {
      dayKey: todayKey(now),
      usedMs: 0,
      lastVisibleAt: null,
    },
    createdAt: now,
  };
}

export function expireLocks(state: AppState, now = Date.now()): AppState {
  const next = { ...state, restriction: { ...state.restriction }, vault: { ...state.vault }, usage: { ...state.usage } };
  if (next.restriction.active && now >= next.restriction.endsAt) {
    next.restriction.active = false;
  }
  if (next.vault.active && now >= next.vault.endsAt) {
    next.vault.active = false;
  }
  if (next.usage.dayKey !== todayKey(now)) {
    next.usage = { dayKey: todayKey(now), usedMs: 0, lastVisibleAt: null };
  }
  return next;
}

export function dailyCapReached(state: AppState): boolean {
  if (!state.vault.active || state.vault.dailyCapMinutes == null) return false;
  return state.usage.usedMs >= state.vault.dailyCapMinutes * 60_000;
}

export function isSettingsFrozen(state: AppState): boolean {
  return state.restriction.active || state.vault.active;
}
