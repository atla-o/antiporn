# Antiporn

Self-restriction for a browser profile: a lock of up to **30 days**, **opaque squares** over detected nudity, and a **time vault** of up to **7 days** that does not expose a stop control. Optional daily usage cap (for example 3 hours). Severity runs from soft (showable skin) to hard (genital-scale clusters). Explicit porn framing is always boxed.

This is a client-side enforcement tool. It is not a kernel driver. The documented abort for a live vault or restriction is a **factory reset** of the device or a full wipe of the browser profile.

## Run locally

```bash
npm install
npm run pack:extension
npm run dev
```

App: http://127.0.0.1:43147

UI tests against a production build:

```bash
npm run build
npm run test:ui
```

## Distribution

Each method is a separate directory — see `distribution/README.md`.

| Channel | Where |
| --- | --- |
| Drag and drop | `distribution/drag-drop/` |
| Terminal | `distribution/terminal/install.sh` |
| Embed | `distribution/embed/snippet.html` |
| Uploadable HTML | `distribution/website/index.html` (also served as `/website.html`) |
| Extension | `extension/` |
| Google Cloud binaries | https://storage.googleapis.com/antiporn-releases/latest/ |
| GitHub source | https://github.com/atla-o/antiporn |

Copy `distribution/website/index.html` to your site. Point `NEXT_PUBLIC_DISTRO_CLOUD_URL` and `NEXT_PUBLIC_GITHUB_URL` at your real bucket and repo before a public deploy.

## Production (Cloud Run)

Public host: [https://antiporn.devoutshaman.com](https://antiporn.devoutshaman.com). GCP Cloud Run service `antiporn-web` in project `devo-holding`, region `us-west1`. Cloudflare is **DNS-only** (grey cloud) to `ghs.googlehosted.com` — no Workers, no orange-cloud proxy, no beta host.

**Push or merge to `main` updates this host.** Do not deploy to GCP from a cloud agent; GitHub Actions on `main` is the path.

The production image is Next.js `output: "standalone"`, listening on `0.0.0.0:$PORT` (Cloud Run default `8080`). `npm ci` uses `package-lock.json` (assembled in the Dockerfile from `docker/lockfile/part*`).

### Auto-deploy

[`.github/workflows/deploy-cloudrun.yml`](.github/workflows/deploy-cloudrun.yml) runs on push to `main` (and `workflow_dispatch`):

```bash
gcloud run deploy antiporn-web \
  --source=. \
  --project=devo-holding \
  --region=us-west1 \
  --no-invoker-iam-check
```

Do **not** pass `--allow-unauthenticated`. Org policy blocks `allUsers` IAM. Public access is `--no-invoker-iam-check`.

### One-time setup (Devo operator: `account@atla-o.com`)

Set these on `atla-o/antiporn` (Settings → Secrets and variables → Actions):

| Name | Where | Value |
| --- | --- | --- |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | repository **variable** (or secret) | `projects/384302503084/locations/global/workloadIdentityPools/github-pool/providers/github-provider` |
| `GCP_SERVICE_ACCOUNT` | repository **variable** (or secret) | `github-cloud-run-deploy@devo-holding.iam.gserviceaccount.com` |

See [gcp/README.md](gcp/README.md).

### Manual deploy

```bash
gcloud run deploy antiporn-web \
  --source=. \
  --project=devo-holding \
  --region=us-west1 \
  --no-invoker-iam-check
```

## Severity

- **Soft** — block exposed skin.
- **Hard** — wait for compact, genital-scale clusters.
- **No-miss rule** — high skin coverage / porn-like framing always receives a square, including at the hard end of the slider.

Detection runs on-device. Images you drop into the preview never leave the browser.

## Workspace

Cursor agents: read `AGENTS.md` first. Same Devo process as Phenomatch.

Half cloud / half local — do not run cloud-only. Cloud agent: web app, backend, GCP, GitHub, docs. Local Mac (or My Machines): overlay, audio, camera, native client, installer, simulator. A Linux cloud VM cannot drive local audio or UI.

Holding Devo. GitHub `atla-o`. GCP `devo-holding` (org atla-o.com, folder Devo). Not Firebase.

This repo is the Antiporn web UI. Native Swift is private [atla-o/anti-porn](https://github.com/atla-o/anti-porn) (Mac only). Phenomatch: [atla-o/phenomatch](https://github.com/atla-o/phenomatch).
