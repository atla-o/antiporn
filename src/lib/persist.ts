import {
  AppState,
  defaultState,
  expireLocks,
  IDB_NAME,
  IDB_STORE,
  STORAGE_KEY,
  STORAGE_MIRROR_KEY,
} from "./state";

function parse(raw: string | null): AppState | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as AppState;
    if (!data || data.version !== 1) return null;
    return data;
  } catch {
    return null;
  }
}

function strongest(candidates: Array<AppState | null>, now: number): AppState {
  const valid = candidates.filter((c): c is AppState => Boolean(c)).map((c) => expireLocks(c, now));
  if (!valid.length) return defaultState(now);
  return valid.reduce((best, cur) => {
    const bestLock = Math.max(
      best.restriction.active ? best.restriction.endsAt : 0,
      best.vault.active ? best.vault.endsAt : 0,
    );
    const curLock = Math.max(
      cur.restriction.active ? cur.restriction.endsAt : 0,
      cur.vault.active ? cur.vault.endsAt : 0,
    );
    if (curLock > bestLock) return cur;
    if (cur.usage.usedMs > best.usage.usedMs && cur.usage.dayKey === best.usage.dayKey) {
      return { ...best, usage: cur.usage };
    }
    return best;
  });
}

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function loadState(): Promise<AppState> {
  const now = Date.now();
  const ls = parse(localStorage.getItem(STORAGE_KEY));
  const mirror = parse(localStorage.getItem(STORAGE_MIRROR_KEY));
  const ss = parse(sessionStorage.getItem(STORAGE_KEY));
  let idb: AppState | null = null;
  const db = await openDb();
  if (db) {
    idb = await new Promise((resolve) => {
      try {
        const tx = db.transaction(IDB_STORE, "readonly");
        const req = tx.objectStore(IDB_STORE).get("state");
        req.onsuccess = () => resolve((req.result as AppState) ?? null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
    db.close();
  }
  const state = strongest([ls, mirror, ss, idb], now);
  await saveState(state);
  return state;
}

export async function saveState(state: AppState): Promise<void> {
  const raw = JSON.stringify(state);
  try {
    localStorage.setItem(STORAGE_KEY, raw);
    localStorage.setItem(STORAGE_MIRROR_KEY, raw);
    sessionStorage.setItem(STORAGE_KEY, raw);
  } catch {
    /* quota / private mode */
  }
  const db = await openDb();
  if (db) {
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(IDB_STORE, "readwrite");
        tx.objectStore(IDB_STORE).put(state, "state");
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
    db.close();
  }
}
