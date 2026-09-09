import { dailyCapReached, expireLocks, isSettingsFrozen, type AppState, MAX_RESTRICTION_DAYS, MAX_VAULT_DAYS } from "./state";
import { todayKey } from "./utils";

export { dailyCapReached, isSettingsFrozen };

export function startRestriction(state: AppState, days: number, now = Date.now()): AppState {
  const clamped = Math.min(MAX_RESTRICTION_DAYS, Math.max(1, Math.round(days)));
  if (state.restriction.active) return state;
  return {
    ...state,
    restriction: {
      active: true,
      startedAt: now,
      endsAt: now + clamped * 86_400_000,
      days: clamped,
    },
  };
}

export function startVault(
  state: AppState,
  days: number,
  dailyCapMinutes: number | null,
  now = Date.now(),
): AppState {
  const clamped = Math.min(MAX_VAULT_DAYS, Math.max(1, Math.round(days)));
  if (state.vault.active) return state;
  return {
    ...state,
    vault: {
      active: true,
      startedAt: now,
      endsAt: now + clamped * 86_400_000,
      days: clamped,
      dailyCapMinutes,
    },
  };
}

export function setSeverity(state: AppState, severity: number): AppState {
  if (isSettingsFrozen(state)) return state;
  return { ...state, severity: Math.max(0, Math.min(100, severity)) };
}

export function tickUsage(state: AppState, elapsedMs: number, visible: boolean, now = Date.now()): AppState {
  let next = expireLocks(state, now);
  if (next.usage.dayKey !== todayKey(now)) {
    next = {
      ...next,
      usage: { dayKey: todayKey(now), usedMs: 0, lastVisibleAt: visible ? now : null },
    };
  }
  if (!next.vault.active || next.vault.dailyCapMinutes == null) {
    return { ...next, usage: { ...next.usage, lastVisibleAt: visible ? now : null } };
  }
  if (!visible) {
    return { ...next, usage: { ...next.usage, lastVisibleAt: null } };
  }
  const add = Math.max(0, Math.min(elapsedMs, 5000));
  return {
    ...next,
    usage: {
      ...next.usage,
      usedMs: next.usage.usedMs + add,
      lastVisibleAt: now,
    },
  };
}

export function remainingRestriction(state: AppState, now = Date.now()): number {
  if (!state.restriction.active) return 0;
  return Math.max(0, state.restriction.endsAt - now);
}

export function remainingVault(state: AppState, now = Date.now()): number {
  if (!state.vault.active) return 0;
  return Math.max(0, state.vault.endsAt - now);
}
