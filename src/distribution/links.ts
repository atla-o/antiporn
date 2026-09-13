/**
 * Live install files are first-party on the Antiporn host.
 * Google Cloud Storage is an optional operator mirror — not required for the UI.
 *
 * Override public origin with NEXT_PUBLIC_APP_URL.
 * Override the optional GCS prefix with NEXT_PUBLIC_DISTRO_CLOUD_URL.
 */

export const APP_PUBLIC_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://antiporn.devoutshaman.com";

export const LOCAL_EXTENSION_ZIP = "/downloads/antiporn-extension.zip";
export const LOCAL_INSTALL_SH = "/install.sh";
export const LOCAL_WEBSITE_HTML = "/website.html";
export const LOCAL_EMBED = "/embed";

export const DISTRO_CLOUD_URL =
  process.env.NEXT_PUBLIC_DISTRO_CLOUD_URL ??
  "https://storage.googleapis.com/antiporn-releases/latest/";

export const DISTRO_CLOUD_INSTALL_SH = `${DISTRO_CLOUD_URL}install.sh`;
export const DISTRO_CLOUD_EXTENSION_ZIP = `${DISTRO_CLOUD_URL}antiporn-extension.zip`;
export const DISTRO_CLOUD_WEBSITE_HTML = `${DISTRO_CLOUD_URL}website.html`;

export const GITHUB_URL =
  process.env.NEXT_PUBLIC_GITHUB_URL ??
  "https://github.com/atla-o/antiporn";

export const GITHUB_ISSUES_URL = `${GITHUB_URL}/issues`;
export const GITHUB_RELEASES_URL = `${GITHUB_URL}/releases`;
