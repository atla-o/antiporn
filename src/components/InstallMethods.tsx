"use client";

import { useEffect, useState } from "react";
import {
  APP_PUBLIC_URL,
  DISTRO_CLOUD_URL,
  DISTRO_INSTALL_SH,
  DISTRO_WEBSITE_HTML,
  DISTRO_ZIP,
  GITHUB_URL,
  LOCAL_EMBED,
} from "@/distribution/links";
import { FlowNote } from "@/components/FlowNote";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/copy";

const ASSETS = [
  { href: DISTRO_ZIP, label: "extension zip" },
  { href: DISTRO_INSTALL_SH, label: "install.sh" },
  { href: DISTRO_WEBSITE_HTML, label: "website.html" },
] as const;

export function InstallMethods() {
  const [origin, setOrigin] = useState(APP_PUBLIC_URL);
  const [copied, setCopied] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [probe, setProbe] = useState<"loading" | "ok" | "error">("loading");
  const [probeNote, setProbeNote] = useState("Checking install artifacts on the Cloud Run API…");
  const [dropNote, setDropNote] = useState(
    "Download the zip, unzip it, then drop that folder on chrome://extensions.",
  );

  useEffect(() => {
    setOrigin(window.location.origin);
    let cancelled = false;
    (async () => {
      try {
        const [health, ...results] = await Promise.all([
          fetch("/api/health", { cache: "no-store" }).then((res) => res.json()).catch(() => null),
          ...ASSETS.map(async (asset) => {
            const res = await fetch(asset.href, { method: "GET", cache: "no-store" });
            return { ...asset, ok: res.ok, source: res.headers.get("X-Antiporn-Distro") };
          }),
        ]);
        if (cancelled) return;
        const missing = results.filter((item) => !item.ok).map((item) => item.label);
        if (missing.length) {
          setProbe("error");
          setProbeNote(`Missing install artifacts: ${missing.join(", ")}.`);
          return;
        }
        const source = results[0]?.source === "gcs" ? "gs://antiporn-releases" : "this host (GCS fallback)";
        const persist = health && typeof health === "object" && "persist" in health ? String(health.persist) : "api";
        setProbe("ok");
        setProbeNote(
          `Extension zip, install.sh, and website.html are ready from ${source}. Lock persist: ${persist} in devo-holding.`,
        );
      } catch {
        if (!cancelled) {
          setProbe("error");
          setProbeNote("Could not reach the Cloud Run install API.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const terminal = `curl -fsSL ${origin}${DISTRO_INSTALL_SH} | bash`;
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
      {copyError && (
        <FlowNote tone="error" testId="install-copy-error">
          {copyError}
        </FlowNote>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-neutral-200 p-4">
          <h3 className="font-semibold">Drag and drop</h3>
          <p className="mt-1 text-sm text-neutral-600">
            Download the packed extension from <code>gs://antiporn-releases</code> via this API, unzip
            it, then drop the folder on chrome://extensions.
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
            <a href={DISTRO_ZIP} data-testid="download-extension-zip">
              Download extension zip
            </a>
          </Button>
        </section>
        <section className="rounded-xl border border-neutral-200 p-4">
          <h3 className="font-semibold">Terminal copy-paste</h3>
          <p className="mt-1 text-sm text-neutral-600">
            The installer pulls the same zip from the Cloud Run distro API (GCS object
            latest/antiporn-extension.zip).
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs text-black">
            {terminal}
          </pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => copy("sh", terminal)} data-testid="copy-installer">
              {copied === "sh" ? "Copied" : "Copy installer"}
            </Button>
            <Button variant="outline" asChild>
              <a href={DISTRO_INSTALL_SH} download="install.sh" data-testid="download-install-sh">
                Download install.sh
              </a>
            </Button>
          </div>
        </section>
        <section className="rounded-xl border border-neutral-200 p-4">
          <h3 className="font-semibold">Uploadable HTML</h3>
          <p className="mt-1 text-sm text-neutral-600">
            Single page from the same bucket prefix. It embeds this app and links the zip and
            installer.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild>
              <a href="/website.html" data-testid="open-website-html">
                Open website.html
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={DISTRO_WEBSITE_HTML} download="antiporn-website.html" data-testid="download-website-html">
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
        Bucket:{" "}
        <a className="underline" href={DISTRO_CLOUD_URL}>
          gs://antiporn-releases
        </a>{" "}
        in project <code>devo-holding</code>. Public downloads use this host&apos;s{" "}
        <code>/api/distro/*</code> because org policy blocks allUsers on the bucket. Source:{" "}
        <a className="underline" href={GITHUB_URL}>
          {GITHUB_URL}
        </a>
        .
      </p>
    </div>
  );
}
