/** GCP project for Antiporn. Spell d-e-v-o-holding. */
export const GCP_PROJECT = process.env.GCP_PROJECT ?? process.env.GOOGLE_CLOUD_PROJECT ?? "devo-holding";
export const GCP_REGION = process.env.GCP_REGION ?? "us-west1";
export const GCS_BUCKET = process.env.GCS_BUCKET ?? "antiporn-releases";
export const GCS_PREFIX = process.env.GCS_PREFIX ?? "latest";
export const FIRESTORE_DATABASE = process.env.FIRESTORE_DATABASE ?? "(default)";
export const FIRESTORE_COLLECTION = process.env.FIRESTORE_COLLECTION ?? "antipornLocks";
export const CLOUD_RUN_SERVICE = process.env.CLOUD_RUN_SERVICE ?? "antiporn-web";

export const DISTRO_FILES = ["antiporn-extension.zip", "install.sh", "website.html", "snippet.html"] as const;
export type DistroFile = (typeof DISTRO_FILES)[number];

export function isDistroFile(name: string): name is DistroFile {
  return (DISTRO_FILES as readonly string[]).includes(name);
}

export function distroContentType(file: DistroFile): string {
  if (file.endsWith(".zip")) return "application/zip";
  if (file.endsWith(".sh")) return "text/x-shellscript; charset=utf-8";
  return "text/html; charset=utf-8";
}
