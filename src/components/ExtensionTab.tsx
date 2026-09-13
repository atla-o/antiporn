"use client";

import { useState } from "react";
import { GITHUB_URL, LOCAL_EXTENSION_ZIP } from "@/distribution/links";
import { FlowNote } from "@/components/FlowNote";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/copy";

export function ExtensionTab() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  async function copyPath() {
    setCopyError(null);
    const ok = await copyText("chrome://extensions");
    if (!ok) {
      setCopyError("Clipboard is blocked. Type chrome://extensions in the address bar.");
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
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
          <a className="underline" href={LOCAL_EXTENSION_ZIP}>
            antiporn-extension.zip
          </a>{" "}
          from this host.
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
      {copyError && <FlowNote tone="error">{copyError}</FlowNote>}
      <p className="text-neutral-500">
        Chrome no longer installs arbitrary .crx files from websites. Unpacked / drag onto
        chrome://extensions is the supported sideload path. Source for the extension lives in{" "}
        <a className="underline" href={`${GITHUB_URL}/tree/main/extension`}>
          /extension
        </a>
        .
      </p>
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <a href={LOCAL_EXTENSION_ZIP}>Download zip</a>
        </Button>
      </div>
    </div>
  );
}
