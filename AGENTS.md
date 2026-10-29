# Antiporn — standing agent keeper

Read this file at the start of every run. This is the keeper for **one standing reusable Cloud Agent** on this repo. Do not spawn a sibling Antiporn web agent. Do not revive leftover Origin/GitHub `devon-schauman/antiporn` (dead/archived).

## What this repo is

[`atla-o/antiporn`](https://github.com/atla-o/antiporn) is the **Antiporn web app plus its browser extension**: an installable product of **Atla LLC** (Devo’s only corp). It lives under the **Wellness** division.

- Public host: https://antiporn.devoutshaman.com
- Cloud Run service: `antiporn-web` (GCP project `devo-holding`, region `us-west1`)
- Filter, Time vault, Install (Preview + Extension nested), black-and-white chrome
- This product is live. Do not frame work as test-mode, demo-only, or “this isn’t live.”

A **separate private Mac app** (Swift filter / daemon / overlay) lives in [`atla-o/anti-porn`](https://github.com/atla-o/anti-porn) (later name: `antiporn-mac`). That repo is out of scope for this cloud agent unless Devo explicitly asks. A Linux cloud VM cannot drive native Mac UI or local audio.

## How it relates to `atla-o/devo`

The corp website is **one repo**, [`atla-o/devo`](https://github.com/atla-o/devo), with **six equal divisions** (say **division**, never “stream” or “house”):

Physics: Products, Modified, Creation.  
Biology: Consumed, Wellness, Covenant.

Wellness fertility and surrogacy pages on that site **link here**. Antiporn does **not** deploy from `atla-o/devo`. Merge to `main` in **this** repo deploys `antiporn-web`. `devo-web` deploys from `atla-o/devo`.

Publisher: [`atla-o`](https://github.com/atla-o). GCP: project `devo-holding` (org `atla-o.com`, folder `Devo`). App data is GCP, not Firebase. Public hosts on `*.devoutshaman.com` (Cloudflare DNS-only → Cloud Run). No Workers, no orange-cloud proxy, no beta host.

## Standing UI-first objective

Keep **one promptable cloud workspace** for this product, current.

1. **Complete functional UI** — usable end-to-end (persist data, real submit paths, loading / empty / error / success). No blocking coming-soon for core flows.
2. Black text on **white** backgrounds always — never follow system dark mode / white-on-black.
3. Ship by opening a PR. **Devo approves merges to `main`.** GitHub Actions on `main` deploys Cloud Run. Do not `gcloud run deploy` from this agent unless Devo explicitly says deploy.

## Data rules

Antiporn does **not** collect SSN or gene/DNA data. Do not add forms, storage, analytics, or APIs that take Social Security numbers, genetic files, DNA sequences, or genealogy uploads. Lock-store state (filter, vault, severity) is profile-scoped restriction data only.

## Workflow (every run)

1. **One standing reusable agent** — this agent, this repo. Extra Antiporn cloud workspaces should be closed.
2. **Pull `main` fresh**, then **branch plus PR**. Never push or merge to `main` yourself. Devo merges.
3. **CI must pass** (`npm run build`; `npm run test:ui` when UI is touched).
4. **Live UI preview:** whenever the web UI changes and that change is not yet on `main`, keep a clickable Cloud Agent preview / tunnel / forwarded-port URL running, paste the **full URL** in every reply while the UI is in flux, **and post the same link in the PR**. Screenshots alone are not enough. https://antiporn.devoutshaman.com is only what has already merged to `main`.
5. Docs-only PRs do not need a preview URL.

Native Swift, Apple Developer, Mac App Store, and notarization stay on the Mac repo unless Devo asks otherwise.
