# Devo product workspace — Antiporn (web)

## Standing objective (Devo UI-first)

Cursor cloud work for this product: **one promptable environment / one cloud workspace**, kept current.

Priority order for every task unless Devo says otherwise:
1. **Complete functional UI** — usable end-to-end (persist data, real submit paths, loading/empty/error/success). No blocking coming-soon for core flows.
2. Black text on **white** backgrounds always — never follow system dark mode / white-on-black.
3. Ship via merge to `main` (Cloud Run Actions). Do not deploy from the agent unless Devo explicitly says push/ship/merge and deploy.

Parent: Devo (lateral health). Publisher: atla-o. GCP app data: project `devo-holding`. Public hosts on `*.devoutshaman.com` (Cloudflare DNS-only → Cloud Run).

Siblings: Phenomatch, Antiporn, Lessfret, Lightround, Acashi. Holding lander: atla-o/devo → devoutshaman.com.

## WORKSPACE RULE (LOUD) — one cloud env for Antiporn

| Where | Repo | Role |
| --- | --- | --- |
| **Cloud Agents / Cursor cloud workspace** | **`atla-o/antiporn`** (this repo) | Public web UI only |
| **Local Mac / My Machines** | **`atla-o/anti-porn`** (private) | Native Swift filter / daemon / overlay |

- **THIS REPO = public web UI only** (`antiporn.devoutshaman.com`).
- Native Swift is private `atla-o/anti-porn` (Mac / My Machines only).
- **Do not treat `anti-porn` as a second cloud web workspace.**
- **One cloud workspace = this web repo** (`atla-o/antiporn`).
- Extra cloud workspaces pointing at Antiporn should be **closed**; one env per product.

## This product

Antiporn. Computer restriction. Blocks porn and anything the user flags as a net negative.

- Public OSS web UI: **this repo** — Filter, Time vault, Install (Preview + Extension nested), black-and-white chrome
- Public host: https://antiporn.devoutshaman.com
- Native Swift (private): [atla-o/anti-porn](https://github.com/atla-o/anti-porn) — Mac only
- Sibling: [atla-o/phenomatch](https://github.com/atla-o/phenomatch) (same half-cloud / half-local process for device-native work)
- Holding: [atla-o/devo](https://github.com/atla-o/devo)

## Half cloud / half local

- **Cloud (Cursor cloud agent):** web app, backend, GCP, GitHub, docs — **only** against `atla-o/antiporn`.
- **Local Mac (Cursor on the machine, or Cursor My Machines):** Swift filter, daemon, overlay, installer, simulator — against `atla-o/anti-porn`.

A Linux cloud VM cannot drive local audio or native Mac UI. Do not run native Swift work in cloud.

## Holding

Devo. GitHub publisher [`atla-o`](https://github.com/atla-o). GCP project `devo-holding` (org `atla-o.com`, folder `Devo`). App data is GCP, not Firebase.

Do not deploy to GCP from a cloud agent. GitHub Actions on `main` deploys Cloud Run service `antiporn-web`.
