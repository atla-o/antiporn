import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  CLOUD_RUN_SERVICE,
  DISTRO_FILES,
  FIRESTORE_COLLECTION,
  FIRESTORE_DATABASE,
  GCP_PROJECT,
  GCP_REGION,
  GCS_BUCKET,
  GCS_PREFIX,
  distroContentType,
  isDistroFile,
  type DistroFile,
} from "@/lib/gcp";
import { parseState, strongestStates, type AppState } from "@/lib/state";

export type PersistKind = "firestore" | "gcs" | "local";
export type DistroKind = "gcs" | "local";

let persistKind: PersistKind | "unknown" = "unknown";
let distroKind: DistroKind = "local";

function forceLocal(): boolean {
  return process.env.ANTIPORN_BACKEND === "local";
}

function lockDir(): string {
  return process.env.ANTIPORN_LOCK_DIR ?? path.join("/tmp", "antiporn-locks");
}

function localDistroPath(file: DistroFile): string {
  if (file === "antiporn-extension.zip") {
    return path.join(process.cwd(), "public", "downloads", file);
  }
  if (file === "snippet.html") {
    return path.join(process.cwd(), "distribution", "embed", file);
  }
  return path.join(process.cwd(), "public", file);
}

export function backendStatus() {
  return {
    ok: true as const,
    project: GCP_PROJECT,
    region: GCP_REGION,
    service: CLOUD_RUN_SERVICE,
    bucket: GCS_BUCKET,
    prefix: `${GCS_PREFIX}/`,
    persist: persistKind === "unknown" ? (forceLocal() ? "local" : "gcp") : persistKind,
    distro: distroKind,
  };
}

async function readLocalLock(id: string): Promise<AppState | null> {
  try {
    const raw = await readFile(path.join(lockDir(), `${id}.json`), "utf8");
    return parseState(raw);
  } catch {
    return null;
  }
}

async function writeLocalLock(id: string, state: AppState): Promise<void> {
  await mkdir(lockDir(), { recursive: true });
  await writeFile(path.join(lockDir(), `${id}.json`), JSON.stringify(state), "utf8");
}

async function firestoreDoc(id: string) {
  const { Firestore } = await import("@google-cloud/firestore");
  const db = new Firestore({ projectId: GCP_PROJECT, databaseId: FIRESTORE_DATABASE });
  return db.collection(FIRESTORE_COLLECTION).doc(id);
}

async function gcsFile(objectPath: string) {
  const { Storage } = await import("@google-cloud/storage");
  const storage = new Storage({ projectId: GCP_PROJECT });
  return storage.bucket(GCS_BUCKET).file(objectPath);
}

async function readGcsLock(id: string): Promise<AppState | null> {
  const file = await gcsFile(`locks/${id}.json`);
  const [exists] = await file.exists();
  if (!exists) return null;
  const [buf] = await file.download();
  return parseState(buf.toString("utf8"));
}

async function writeGcsLock(id: string, state: AppState): Promise<void> {
  const file = await gcsFile(`locks/${id}.json`);
  await file.save(JSON.stringify(state), { contentType: "application/json", resumable: false });
}

async function readFirestoreLock(id: string): Promise<AppState | null> {
  const doc = await firestoreDoc(id);
  const snap = await doc.get();
  if (!snap.exists) return null;
  return parseState(snap.data()?.state);
}

async function writeFirestoreLock(id: string, state: AppState): Promise<void> {
  const doc = await firestoreDoc(id);
  await doc.set({ state, updatedAt: Date.now(), project: GCP_PROJECT }, { merge: true });
}

async function probePersist(): Promise<PersistKind> {
  if (forceLocal()) return "local";
  if (persistKind !== "unknown") return persistKind;
  try {
    const doc = await firestoreDoc("_health");
    await doc.set({ ping: Date.now(), project: GCP_PROJECT }, { merge: true });
    persistKind = "firestore";
    return persistKind;
  } catch {
    /* try GCS */
  }
  try {
    const file = await gcsFile("locks/_health.json");
    await file.save(JSON.stringify({ ping: Date.now(), project: GCP_PROJECT }), {
      contentType: "application/json",
      resumable: false,
    });
    persistKind = "gcs";
    return persistKind;
  } catch {
    persistKind = "local";
    return persistKind;
  }
}

export async function readLock(id: string): Promise<AppState | null> {
  const kind = await probePersist();
  if (kind === "firestore") {
    try {
      return await readFirestoreLock(id);
    } catch {
      return readGcsLock(id).catch(() => readLocalLock(id));
    }
  }
  if (kind === "gcs") {
    try {
      return await readGcsLock(id);
    } catch {
      return readLocalLock(id);
    }
  }
  return readLocalLock(id);
}

export async function writeLock(id: string, incoming: AppState): Promise<{ state: AppState; persist: PersistKind }> {
  const existing = await readLock(id);
  const state = strongestStates([existing, incoming]);
  const kind = await probePersist();
  if (kind === "firestore") {
    try {
      await writeFirestoreLock(id, state);
      return { state, persist: "firestore" };
    } catch {
      await writeGcsLock(id, state).catch(() => writeLocalLock(id, state));
      return { state, persist: persistKind === "unknown" ? "local" : persistKind };
    }
  }
  if (kind === "gcs") {
    try {
      await writeGcsLock(id, state);
      return { state, persist: "gcs" };
    } catch {
      await writeLocalLock(id, state);
      return { state, persist: "local" };
    }
  }
  await writeLocalLock(id, state);
  return { state, persist: "local" };
}

export async function readDistro(
  file: string,
): Promise<{ body: Buffer; contentType: string; source: DistroKind; file: DistroFile } | null> {
  if (!isDistroFile(file)) return null;

  if (!forceLocal()) {
    try {
      const object = await gcsFile(`${GCS_PREFIX}/${file}`);
      const [exists] = await object.exists();
      if (exists) {
        const [body] = await object.download();
        distroKind = "gcs";
        return { body, contentType: distroContentType(file), source: "gcs", file };
      }
    } catch {
      /* fall through to the packed host files */
    }
  }

  try {
    const body = await readFile(localDistroPath(file));
    distroKind = "local";
    return { body, contentType: distroContentType(file), source: "local", file };
  } catch {
    return null;
  }
}

export function listedDistroFiles() {
  return DISTRO_FILES;
}
