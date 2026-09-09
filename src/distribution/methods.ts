/**
 * One module per distribution channel lives under /distribution.
 * This file is the in-app index so the UI and docs stay aligned.
 */
export const DISTRIBUTION_METHODS = [
  {
    id: "drag-drop",
    title: "Drag and drop",
    path: "distribution/drag-drop/",
    summary: "Download the extension zip and drop the unpacked folder onto chrome://extensions.",
  },
  {
    id: "terminal",
    title: "Terminal copy-paste",
    path: "distribution/terminal/install.sh",
    summary: "curl | bash installer when drag-and-drop is unavailable.",
  },
  {
    id: "embed",
    title: "Website embed",
    path: "distribution/embed/snippet.html",
    summary: "Iframe the live Antiporn app. Preview and the extension live under Install.",
  },
  {
    id: "website-html",
    title: "Uploadable HTML",
    path: "distribution/website/index.html",
    summary: "Single HTML file to host on your own site.",
  },
  {
    id: "browser-extension",
    title: "Browser extension",
    path: "extension/",
    summary: "Manifest V3 overlay for page images and video frames.",
  },
  {
    id: "google-cloud",
    title: "Google Cloud distro",
    path: "distribution/google-cloud/",
    summary: "Canonical binary host (install.sh, zip, website.html).",
  },
  {
    id: "github",
    title: "GitHub source",
    path: "distribution/github/",
    summary: "Open-source code and issues.",
  },
] as const;
