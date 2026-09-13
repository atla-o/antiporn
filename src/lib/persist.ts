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

export async function loadState(): Promise<{ state: AppState; warning: string | null }> {
  const now = Date.now();
  try {
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
    const warning = await saveState(state);
    return { state, warning };
  } catch {
    return {
      state: defaultState(now),
      warning: "Lock store could not be read. Working from a fresh session on this profile.",
    };
  }
}

export async function saveState(state: AppState): Promise<string | null> {
  const raw = JSON.stringify(state);
  let memoryOk = false;
  try {
    localStorage.setItem(STORAGE_KEY, raw);
    localStorage.setItem(STORAGE_MIRROR_KEY, raw);
    sessionStorage.setItem(STORAGE_KEY, raw);
    memoryOk = true;
  } catch {
    /* quota / private mode */
  }
  let idbOk = false;
  const db = await openDb();
  if (db) {
    idbOk = await new Promise((resolve) => {
      try {
        const tx = db.transaction(IDB_STORE, "readwrite");
        tx.objectStore(IDB_STORE).put(state, "state");
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
    db.close();
  }
  if (memoryOk || idbOk) return null;
  return "Could not persist the lock store on this profile. A private window or full storage quota will not keep the timer across reloads.";
}
