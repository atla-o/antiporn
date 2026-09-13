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

The running Antiporn host is the live install channel:

- `/downloads/antiporn-extension.zip`
- `/install.sh`
- `/website.html`
- `/embed`

Public URL helpers live in `src/distribution/links.ts`. Google Cloud Storage is an optional operator mirror, not a UI requirement.
