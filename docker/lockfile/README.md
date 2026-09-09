These `part00`–`part04` files concatenate **in order** to the canonical `package-lock.json` used by `npm ci` in the Cloud Run image.

```bash
cat docker/lockfile/part00 docker/lockfile/part01 docker/lockfile/part02 docker/lockfile/part03 docker/lockfile/part04 > package-lock.json
npm ci
```

After changing dependencies, run `./scripts/sync-lockfile-parts.sh`.
