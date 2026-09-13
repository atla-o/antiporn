# Drag-and-drop install

Primary install path for Chromium.

1. Download [antiporn-extension.zip](https://antiporn.devoutshaman.com/downloads/antiporn-extension.zip) from the Antiporn host (`/downloads/antiporn-extension.zip` on any running app).
2. Unzip. Confirm `manifest.json` is at the folder root.
3. Open `chrome://extensions` and turn on Developer mode.
4. Drag the unzipped folder onto that page (or click Load unpacked).

Safari and Firefox do not accept this drop. Use the terminal installer in `distribution/terminal/install.sh` to place files, then load the unpacked add-on from the browser’s own developer UI.

Open source: https://github.com/atla-o/antiporn
