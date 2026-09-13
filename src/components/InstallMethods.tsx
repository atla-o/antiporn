"use client";

import { useEffect, useState } from "react";
import {
  APP_PUBLIC_URL,
  GITHUB_URL,
  LOCAL_EMBED,
  LOCAL_EXTENSION_ZIP,
  LOCAL_INSTALL_SH,
  LOCAL_WEBSITE_HTML,
} from "@/distribution/links";
import { FlowNote } from "@/components/FlowNote";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/copy";

const ASSETS = [
  { href: LOCAL_EXTENSION_ZIP, label: "extension zip" },
  { href: LOCAL_INSTALL_SH, label: "install.sh" },
  { href: LOCAL_WEBSITE_HTML, label: "website.html" },
] as const;

export function InstallMethods() {
  const [origin, setOrigin] = useState(APP_PUBLIC_URL);
  const [copied, setCopied] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [probe, setProbe] = useState<"loading" | "ok" | "error">("loading");
  const [probeNote, setProbeNote] = useState("Checking install files on this host…");
  const [dropNote, setDropNote] = useState(
    "Download the zip, unzip it, then drop that folder on chrome://extensions.",
  );

  useEffect(() => {
    setOrigin(window.location.origin);
    let cancelled = false;
    (async () => {
      try {
        const results = await Promise.all(
          ASSETS.map(async (asset) => {
            const res = await fetch(asset.href, { method: "GET", cache: "no-store" });
            return { ...asset, ok: res.ok };
          }),
        );
        if (cancelled) return;
        const missing = results.filter((item) => !item.ok).map((item) => item.label);
        if (missing.length) {
          setProbe("error");
          setProbeNote(`Missing on this host: ${missing.join(", ")}.`);
        } else {
          setProbe("ok");
          setProbeNote("Extension zip, install.sh, and website.html are ready on this host.");
        }
      } catch {
        if (!cancelled) {
          setProbe("error");
          setProbeNote("Could not reach install files on this host.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const terminal = `curl -fsSL ${origin}${LOCAL_INSTALL_SH} | bash`;
  const embed = `<iframe src="${origin}${LOCAL_EMBED}" title="Antiporn" style="width:100%;height:720px;border:0;border-radius:12px"></iframe>`;

  async function copy(id: string, text: string) {
    setCopyError(null);
    const ok = await copyText(text);
    if (!ok) {
      setCopyError("Clipboard is blocked in this browser. Select the text and copy it manually.");
      setCopied(null);
      return;
    }
    setCopied(id);
    window.setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-4">
      <FlowNote tone={probe === "loading" ? "loading" : probe === "error" ? "error" : "success"} testId="install-assets">
        {probeNote}
      </FlowNote>
      {copyError && <FlowNote tone="error" testId="install-copy-error">{copyError}</FlowNote>}
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-neutral-200 p-4">
          <h3 className="font-semibold">Drag and drop</h3>
          <p className="mt-1 text-sm text-neutral-600">
            Primary path. Download the packed extension from this host, unzip it, then drop the
            folder on chrome://extensions.
          </p>
          <div
            className="mt-3 flex min-h-32 items-center justify-center rounded-lg border border-dashed border-neutral-400 bg-neutral-50 px-3 text-center text-sm text-neutral-600"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              setDropNote(
                file
                  ? `Received ${file.name}. Unzip, then drop the folder on chrome://extensions.`
                  : dropNote,
              );
            }}
          >
            {dropNote}
          </div>
          <Button className="mt-3" asChild>
            <a href={LOCAL_EXTENSION_ZIP} data-testid="download-extension-zip">
              Download extension zip
            </a>
          </Button>
        </section>
        <section className="rounded-xl border border-neutral-200 p-4">
          <h3 className="font-semibold">Terminal copy-paste</h3>
          <p className="mt-1 text-sm text-neutral-600">
            Use when drag-and-drop is blocked. The script pulls the same zip from this host.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs text-black">
            {terminal}
          </pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => copy("sh", terminal)} data-testid="copy-installer">
              {copied === "sh" ? "Copied" : "Copy installer"}
            </Button>
            <Button variant="outline" asChild>
              <a href={LOCAL_INSTALL_SH} download="install.sh" data-testid="download-install-sh">
                Download install.sh
              </a>
            </Button>
          </div>
        </section>
        <section className="rounded-xl border border-neutral-200 p-4">
          <h3 className="font-semibold">Uploadable HTML</h3>
          <p className="mt-1 text-sm text-neutral-600">
            Single page you can host yourself. It embeds this app and links the same zip and
            installer.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild>
              <a href={LOCAL_WEBSITE_HTML} data-testid="open-website-html">
                Open website.html
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={LOCAL_WEBSITE_HTML} download="antiporn-website.html" data-testid="download-website-html">
                Download website.html
              </a>
            </Button>
          </div>
        </section>
        <section className="rounded-xl border border-neutral-200 p-4">
          <h3 className="font-semibold">Website embed</h3>
          <p className="mt-1 text-sm text-neutral-600">
            Iframe the live Antiporn app. Preview and the extension live under Install.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs text-black">
            {embed}
          </pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => copy("embed", embed)} data-testid="copy-embed">
              {copied === "embed" ? "Copied" : "Copy embed"}
            </Button>
            <Button variant="outline" asChild>
              <a href={LOCAL_EMBED} data-testid="open-embed">
                Open embed
              </a>
            </Button>
          </div>
        </section>
      </div>
      <p className="text-xs text-neutral-500">
        Source:{" "}
        <a className="underline" href={GITHUB_URL}>
          {GITHUB_URL}
        </a>
        . This page serves the zip, installer, uploadable HTML, and embed. A Cloud Storage mirror is
        optional for operators and is not required here.
      </p>
    </div>
  );
}
