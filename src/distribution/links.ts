/**
 * Live install artifacts come from gs://antiporn-releases in project `devo-holding`.
 * The Cloud Run API at /api/distro/* is the working public download path (org policy
 * blocks allUsers on the bucket itself).
 */

export const APP_PUBLIC_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://antiporn.devoutshaman.com";

export const DISTRO_ZIP = "/api/distro/antiporn-extension.zip";
export const DISTRO_INSTALL_SH = "/api/distro/install.sh";
export const DISTRO_WEBSITE_HTML = "/api/distro/website.html";
export const DISTRO_SNIPPET = "/api/distro/snippet.html";
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
