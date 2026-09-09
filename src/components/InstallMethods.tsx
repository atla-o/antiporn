"use client";

import { useState } from "react";
import { DISTRO_CLOUD_INSTALL_SH, DISTRO_CLOUD_URL, GITHUB_URL } from "@/distribution/links";
import { Button } from "@/components/ui/button";

const TERMINAL = `curl -fsSL ${DISTRO_CLOUD_INSTALL_SH} | bash`;

export function InstallMethods() {
  const [copied, setCopied] = useState<string | null>(null);
  const [dropNote, setDropNote] = useState("Drop the extension zip here to save it, then drag that folder onto chrome://extensions.");

  async function copy(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-xl border border-neutral-200 p-4">
        <h3 className="font-semibold">Drag and drop</h3>
        <p className="mt-1 text-sm text-neutral-600">
          Primary path. Files live in <code className="text-neutral-800">distribution/drag-drop/</code>.
        </p>
        <div
          className="mt-3 flex min-h-32 items-center justify-center rounded-lg border border-dashed border-neutral-400 bg-neutral-50 px-3 text-center text-sm text-neutral-600"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            setDropNote(f ? `Received ${f.name}. Unzip, then drop the folder on chrome://extensions.` : dropNote);
          }}
        >
          {dropNote}
        </div>
        <Button className="mt-3" asChild>
          <a href="/downloads/antiporn-extension.zip">Get drop package</a>
        </Button>
      </section>
      <section className="rounded-xl border border-neutral-200 p-4">
        <h3 className="font-semibold">Terminal copy-paste</h3>
        <p className="mt-1 text-sm text-neutral-600">
          Use when drag-and-drop is blocked. Script: <code className="text-neutral-800">distribution/terminal/install.sh</code>
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs text-black">{TERMINAL}</pre>
        <Button className="mt-3" variant="outline" onClick={() => copy("sh", TERMINAL)}>
          {copied === "sh" ? "Copied" : "Copy installer"}
        </Button>
      </section>
      <section className="rounded-xl border border-neutral-200 p-4 md:col-span-2">
        <h3 className="font-semibold">Website embed</h3>
        <p className="mt-1 text-sm text-neutral-600">
          Snippet in <code className="text-neutral-800">distribution/embed/snippet.html</code>. Uploadable
          landing page: <code className="text-neutral-800">distribution/website/index.html</code> (also at
          /website.html).
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs text-black">{`<iframe src="${typeof window !== "undefined" ? window.location.origin : ""}/embed" title="Antiporn" style="width:100%;height:720px;border:0;border-radius:12px"></iframe>`}</pre>
        <p className="mt-3 text-xs text-neutral-500">
          Binaries: <a className="underline" href={DISTRO_CLOUD_URL}>{DISTRO_CLOUD_URL}</a> · Source:{" "}
          <a className="underline" href={GITHUB_URL}>{GITHUB_URL}</a>
        </p>
      </section>
    </div>
  );
}
