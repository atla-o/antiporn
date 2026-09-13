# GitHub (open source)

Source of truth for code, issues, and review:

https://github.com/atla-o/antiporn

This repository is the public code. Install artifacts are stored in `gs://antiporn-releases` (project `devo-holding`) and downloaded through `/api/distro/*`. Filter and vault settings persist through `/api/locks/:id`.

Clone:

```bash
git clone https://github.com/atla-o/antiporn.git
cd antiporn
npm install
npm run pack:extension
npm run dev
```
