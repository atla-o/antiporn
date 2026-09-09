# GCP for Antiporn web

Project **`devo-holding`** (spell d-e-v-o-holding). Region `us-west1`. Cloud Run service `antiporn-web`.

Do not deploy from a cloud agent. GitHub Actions on `main` is the path.

WIF (set on `atla-o/antiporn` Actions variables):

- `GCP_WORKLOAD_IDENTITY_PROVIDER` = `projects/384302503084/locations/global/workloadIdentityPools/github-pool/providers/github-provider`
- `GCP_SERVICE_ACCOUNT` = `github-cloud-run-deploy@devo-holding.iam.gserviceaccount.com`

Public host: https://antiporn.devoutshaman.com — Cloudflare **DNS-only** (grey cloud) to `ghs.googlehosted.com`. No Workers, no orange-cloud proxy, no beta host.
