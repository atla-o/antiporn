# GCP for Antiporn web

Project **`devo-holding`** (spell d-e-v-o-holding). Region `us-west1`. Cloud Run service `antiporn-web`.

Do not deploy from a cloud agent. GitHub Actions on `main` is the path.

## Runtime backend

The Next.js Cloud Run service is the public API:

| Path | Backing store |
| --- | --- |
| `GET/PUT /api/locks/:profileId` | Firestore collection `antipornLocks` in `devo-holding`, falling back to `gs://antiporn-releases/locks/` |
| `GET /api/distro/:file` | `gs://antiporn-releases/latest/` (`antiporn-extension.zip`, `install.sh`, `website.html`, `snippet.html`), falling back to files packed in the image |
| `GET /api/health` | Reports project, bucket, persist kind, distro kind |

Org policy in `devo-holding` blocks `allUsers` IAM. The bucket stays private. Users download through `/api/distro/*` on https://antiporn.devoutshaman.com. That is the working install channel.

## One-time operator setup (`account@atla-o.com`)

```bash
gcloud services enable \
  firestore.googleapis.com \
  storage.googleapis.com \
  run.googleapis.com \
  --project=devo-holding

gcloud firestore databases create \
  --project=devo-holding \
  --location=us-west1 \
  --type=firestore-native || true

gcloud storage buckets describe gs://antiporn-releases --project=devo-holding \
  || gcloud storage buckets create gs://antiporn-releases \
       --project=devo-holding \
       --location=us-west1 \
       --uniform-bucket-level-access

# Deploy SA (already used by GitHub Actions)
gcloud storage buckets add-iam-policy-binding gs://antiporn-releases \
  --member=serviceAccount:github-cloud-run-deploy@devo-holding.iam.gserviceaccount.com \
  --role=roles/storage.admin \
  --project=devo-holding

# Cloud Run runtime default compute SA — replace PROJECT_NUMBER
PROJECT_NUMBER="$(gcloud projects describe devo-holding --format='value(projectNumber)')"
gcloud projects add-iam-policy-binding devo-holding \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role=roles/datastore.user
gcloud storage buckets add-iam-policy-binding gs://antiporn-releases \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role=roles/storage.objectAdmin \
  --project=devo-holding
```

Do **not** add `allUsers` object viewers. Public access is Cloud Run `--no-invoker-iam-check`.

Publish artifacts (also runs on merge to `main`):

```bash
npm run pack:extension
bash scripts/publish-distro.sh
```

## GitHub Actions

WIF (set on `atla-o/antiporn` Actions variables):

- `GCP_WORKLOAD_IDENTITY_PROVIDER` = `projects/384302503084/locations/global/workloadIdentityPools/github-pool/providers/github-provider`
- `GCP_SERVICE_ACCOUNT` = `github-cloud-run-deploy@devo-holding.iam.gserviceaccount.com`

The deploy workflow on `main`:

1. Deploys Cloud Run `antiporn-web` (not from a cloud agent).
2. Creates `gs://antiporn-releases` if missing.
3. Uploads `latest/install.sh`, `latest/antiporn-extension.zip`, `latest/website.html`, `latest/snippet.html`.

Cloud Run env set on deploy: `GCP_PROJECT=devo-holding`, `GCS_BUCKET=antiporn-releases`.

Public host: https://antiporn.devoutshaman.com — Cloudflare **DNS-only** (grey cloud) to `ghs.googlehosted.com`. No Workers, no orange-cloud proxy, no beta host.
