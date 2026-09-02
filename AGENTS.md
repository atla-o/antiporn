# Devo product workspace

Same process for Phenomatch and Antiporn. Do not invent a different workflow per product.

## Half cloud / half local

- **Cloud (Cursor cloud agent):** web app, backend, GCP, GitHub, docs.
- **Local Mac (Cursor on the machine, or Cursor My Machines):** anything that needs the device — overlay, audio, camera, native client, installer, simulator.

A Linux cloud VM cannot drive local audio or UI. Do not run this product cloud-only.

## Holding

Devo. GitHub publisher [`atla-o`](https://github.com/atla-o). GCP project `devo-holding` (org `atla-o.com`, folder `Devo`). App data is GCP, not Firebase.

## This product

Antiporn. Computer restriction. Blocks porn and anything the user flags as a net negative.

- Public OSS: [atla-o/antiporn](https://github.com/atla-o/antiporn)
- Native Swift (private): [atla-o/anti-porn](https://github.com/atla-o/anti-porn) — Mac only
- Web UI Cursor workspace: `devon-schauman/antiporn` (Filter, Time vault, Install)
- Sibling: [atla-o/phenomatch](https://github.com/atla-o/phenomatch) (same process)
- Holding: [atla-o/devo](https://github.com/atla-o/devo)
