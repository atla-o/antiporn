"use client";

import { useState } from "react";
import { DISTRO_CLOUD_EXTENSION_ZIP, GITHUB_URL } from "@/distribution/links";
import { Button } from "@/components/ui/button";

export function ExtensionTab() {
  const [copied, setCopied] = useState(false);
  const localZip = "/downloads/antiporn-extension.zip";

  async function copyPath() {
    await navigator.clipboard.writeText("chrome://extensions");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-4 text-sm text-neutral-800">
      <p>
        The Antiporn extension is Manifest V3. It scans images and video frames, then paints opaque
        squares using the same high-recall detector as this app. It reads severity from the same
        lock store.
      </p>
      <ol className="list-decimal space-y-2 pl-5 text-neutral-600">
        <li>
          Download{" "}
          <a className="underline" href={localZip}>
            antiporn-extension.zip
          </a>{" "}
          (local) or the{" "}
          <a className="underline" href={DISTRO_CLOUD_EXTENSION_ZIP}>
            Google Cloud copy
          </a>
          .
        </li>
        <li>Unzip it. You should see manifest.json at the top level.</li>
        <li>
          Open{" "}
          <button type="button" className="underline" onClick={copyPath}>
            chrome://extensions
          </button>
          {copied ? " (copied)" : ""} and enable Developer mode.
        </li>
        <li>Drag the unzipped folder onto that page, or use Load unpacked.</li>
      </ol>
      <p className="text-neutral-500">
        Chrome no longer installs arbitrary .crx files from websites. Unpacked / drag onto
        chrome://extensions is the supported sideload path until a Web Store listing exists. Source
        for the extension lives in <a className="underline" href={`${GITHUB_URL}/tree/main/extension`}>/extension</a>.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <a href={localZip}>Download zip</a>
        </Button>
        <Button variant="outline" asChild>
          <a href={DISTRO_CLOUD_EXTENSION_ZIP}>Cloud zip</a>
        </Button>
      </div>
    </div>
  );
}
