/**
 * Canonical public destinations.
 * Google Cloud Storage is the binary/install channel.
 * GitHub is the open-source source of truth.
 *
 * Override with NEXT_PUBLIC_DISTRO_CLOUD_URL and NEXT_PUBLIC_GITHUB_URL.
 */
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

export const APP_PUBLIC_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://antiporn.devoutshaman.com";
