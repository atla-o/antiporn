# Distribution methods

Each channel is a separate directory. Do not mix installers.

| Method | Directory |
| --- | --- |
| Drag and drop | `distribution/drag-drop/` |
| Terminal copy-paste | `distribution/terminal/` |
| Embed snippet | `distribution/embed/` |
| Uploadable website HTML | `distribution/website/` |
| Browser extension | `extension/` and `distribution/browser-extension/` |
| Google Cloud binaries | `distribution/google-cloud/` |
| GitHub source | `distribution/github/` |

Working downloads are the Cloud Run API, which reads `gs://antiporn-releases` in project `devo-holding`:

- `/api/distro/antiporn-extension.zip`
- `/api/distro/install.sh`
- `/api/distro/website.html`
- `/embed`

Helpers live in `src/distribution/links.ts`. Bucket setup: `gcp/README.md`.
