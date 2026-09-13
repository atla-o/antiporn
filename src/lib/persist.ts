import {
  AppState,
  PROFILE_KEY,
  STORAGE_KEY,
  STORAGE_MIRROR_KEY,
  expireLocks,
  IDB_NAME,
  IDB_STORE,
  isProfileId,
  parseState,
  strongestStates,
} from "./state";

export type SyncStatus = "loading" | "saving" | "saved" | "local" | "error";

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

export function getProfileId(): string {
  try {
    const existing = localStorage.getItem(PROFILE_KEY);
    if (existing && isProfileId(existing)) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(PROFILE_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function setProfileId(id: string): boolean {
  if (!isProfileId(id)) return false;
  try {
    localStorage.setItem(PROFILE_KEY, id);
    return true;
  } catch {
    return false;
  }
}

async function readIdb(): Promise<AppState | null> {
  const db = await openDb();
  if (!db) return null;
  const value = await new Promise<AppState | null>((resolve) => {
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
  return value;
}

export async function saveLocal(state: AppState): Promise<string | null> {
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
  return "Could not cache the lock store on this profile.";
}

function readLocalMemory(): AppState | null {
  try {
    return strongestStates([
      parseState(localStorage.getItem(STORAGE_KEY)),
      parseState(localStorage.getItem(STORAGE_MIRROR_KEY)),
      parseState(sessionStorage.getItem(STORAGE_KEY)),
    ].filter(Boolean) as AppState[]);
  } catch {
    return null;
  }
}

async function putRemote(profileId: string, state: AppState): Promise<{ ok: boolean; persist?: string }> {
  const res = await fetch(`/api/locks/${profileId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state }),
  });
  if (!res.ok) return { ok: false };
  const data = (await res.json()) as { persist?: string };
  return { ok: true, persist: data.persist };
}

export async function loadState(): Promise<{
  state: AppState;
  warning: string | null;
  profileId: string;
  remote: boolean;
}> {
  const now = Date.now();
  const profileId = getProfileId();
  try {
    const local = strongestStates([readLocalMemory(), await readIdb()], now);
    const res = await fetch(`/api/locks/${profileId}`, { cache: "no-store" });
    if (!res.ok) {
      await saveLocal(local);
      return {
        state: local,
        warning: "Lock API returned an error. Using the on-device cache.",
        profileId,
        remote: false,
      };
    }
    const data = (await res.json()) as { state: unknown };
    const remote = parseState(data.state);
    const state = strongestStates([local, remote], now);
    await saveLocal(state);
    if (!remote || JSON.stringify(expireLocks(remote, now)) !== JSON.stringify(state)) {
      await putRemote(profileId, state);
    }
    return { state, warning: null, profileId, remote: true };
  } catch {
    const fallback = strongestStates([readLocalMemory()], now);
    await saveLocal(fallback);
    return {
      state: fallback,
      warning: "Lock API unreachable. Using the on-device cache.",
      profileId,
      remote: false,
    };
  }
}

let remoteTimer: ReturnType<typeof setTimeout> | null = null;
let pending: AppState | null = null;
let flushPromise: Promise<{ warning: string | null; status: SyncStatus }> | null = null;

export async function saveState(
  state: AppState,
  opts: { immediate?: boolean } = {},
): Promise<{ warning: string | null; status: SyncStatus }> {
  const profileId = getProfileId();
  const localWarning = await saveLocal(state);
  pending = state;

  const flush = async (): Promise<{ warning: string | null; status: SyncStatus }> => {
    const next = pending ?? state;
    pending = null;
    if (remoteTimer) {
      clearTimeout(remoteTimer);
      remoteTimer = null;
    }
    flushPromise = null;
    try {
      const result = await putRemote(profileId, next);
      if (!result.ok) {
        return {
          warning: localWarning ?? "Cloud Run lock API rejected the write.",
          status: "error",
        };
      }
      return { warning: localWarning, status: result.persist === "local" ? "local" : "saved" };
    } catch {
      return {
        warning: localWarning ?? "Could not reach the Cloud Run lock API.",
        status: "error",
      };
    }
  };

  if (opts.immediate) return flush();
  if (!flushPromise) {
    flushPromise = new Promise((resolve) => {
      remoteTimer = setTimeout(() => {
        resolve(flush());
      }, 1500);
    });
  }
  return flushPromise;
}
