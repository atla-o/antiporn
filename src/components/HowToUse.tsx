"use client";

import { GITHUB_URL, LOCAL_EMBED, LOCAL_EXTENSION_ZIP, LOCAL_INSTALL_SH, LOCAL_WEBSITE_HTML } from "@/distribution/links";

const steps = [
  {
    title: "Install",
    body: "Download the extension zip from this host, or paste the terminal installer. Both pull the same packed folder. website.html and the embed route are here too.",
  },
  {
    title: "Set severity",
    body: "Soft covers showable skin. Hard waits for genital-scale clusters. Explicit porn framing is boxed at every setting.",
  },
  {
    title: "Engage filter",
    body: "Choose 1–30 days and type LOCK. Settings freeze. Closing the app does not stop the clock.",
  },
  {
    title: "Seal a vault if you need it",
    body: "Up to 7 days, optional daily cap (for example 3 hours). No stop control. Factory reset is the abort.",
  },
  {
    title: "Keep the extension on",
    body: "The browser extension draws the same squares over page images and videos. Load it unpacked from the zip, then leave it enabled.",
  },
];

export function HowToUse() {
  return (
    <ol className="space-y-4">
      {steps.map((s, i) => (
        <li key={s.title} className="rounded-lg border border-neutral-200 p-4">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Step {i + 1}</p>
          <h3 className="mt-1 font-semibold">{s.title}</h3>
          <p className="mt-1 text-sm text-neutral-600">{s.body}</p>
        </li>
      ))}
      <li className="text-sm text-neutral-500">
        Installer:{" "}
        <a className="underline" href={LOCAL_INSTALL_SH}>
          install.sh
        </a>
        {" · "}
        Extension:{" "}
        <a className="underline" href={LOCAL_EXTENSION_ZIP}>
          zip
        </a>
        {" · "}
        Page:{" "}
        <a className="underline" href={LOCAL_WEBSITE_HTML}>
          website.html
        </a>
        {" · "}
        Embed:{" "}
        <a className="underline" href={LOCAL_EMBED}>
          /embed
        </a>
        {" · "}
        Source:{" "}
        <a className="underline" href={GITHUB_URL}>
          {GITHUB_URL}
        </a>
      </li>
    </ol>
  );
}
