#!/usr/bin/env bash
# Publish install artifacts to gs://antiporn-releases in project devo-holding.
# Does not deploy Cloud Run. Safe to run from GitHub Actions after WIF auth.
set -euo pipefail

PROJECT="${GCP_PROJECT:-devo-holding}"
BUCKET="${GCS_BUCKET:-antiporn-releases}"
LOCATION="${GCP_REGION:-us-west1}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if ! command -v gcloud >/dev/null 2>&1; then
  echo "gcloud is required to publish gs://${BUCKET}" >&2
  exit 1
fi

if [ ! -f "$ROOT/public/downloads/antiporn-extension.zip" ]; then
  echo "Missing packed zip. Run npm run pack:extension first." >&2
  exit 1
fi

if ! gcloud storage buckets describe "gs://${BUCKET}" --project="${PROJECT}" >/dev/null 2>&1; then
  echo "Creating gs://${BUCKET} in ${PROJECT} (${LOCATION})"
  gcloud storage buckets create "gs://${BUCKET}" \
    --project="${PROJECT}" \
    --location="${LOCATION}" \
    --uniform-bucket-level-access
fi

gcloud storage cp "$ROOT/public/install.sh" "gs://${BUCKET}/latest/install.sh" \
  --project="${PROJECT}" --cache-control="public,max-age=300" --content-type="text/x-shellscript"
gcloud storage cp "$ROOT/public/website.html" "gs://${BUCKET}/latest/website.html" \
  --project="${PROJECT}" --cache-control="public,max-age=300" --content-type="text/html"
gcloud storage cp "$ROOT/public/downloads/antiporn-extension.zip" "gs://${BUCKET}/latest/antiporn-extension.zip" \
  --project="${PROJECT}" --cache-control="public,max-age=300" --content-type="application/zip"
gcloud storage cp "$ROOT/distribution/embed/snippet.html" "gs://${BUCKET}/latest/snippet.html" \
  --project="${PROJECT}" --cache-control="public,max-age=300" --content-type="text/html"

echo "Published latest/ artifacts to gs://${BUCKET} (project ${PROJECT})"
