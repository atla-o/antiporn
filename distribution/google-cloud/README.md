# Google Cloud distribution

Canonical artifact bucket in project `devo-holding`:

`gs://antiporn-releases`

The web UI does not link dead public GCS URLs (org policy blocks `allUsers`). Users download through `/api/distro/*` on Cloud Run `antiporn-web`, which reads this bucket.

Publish these objects to the `antiporn-releases` bucket, `latest/` prefix:

- `install.sh` ← `distribution/terminal/install.sh`
- `antiporn-extension.zip` ← packed `extension/`
- `website.html` ← `distribution/website/index.html`

Example upload:

```bash
gcloud storage cp distribution/terminal/install.sh gs://antiporn-releases/latest/install.sh --cache-control="public,max-age=300"
gcloud storage cp public/downloads/antiporn-extension.zip gs://antiporn-releases/latest/antiporn-extension.zip
gcloud storage cp distribution/website/index.html gs://antiporn-releases/latest/website.html
```

Override the bucket in the app with `NEXT_PUBLIC_DISTRO_CLOUD_URL`.
