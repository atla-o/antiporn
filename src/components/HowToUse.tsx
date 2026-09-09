"use client";

import { DISTRO_CLOUD_EXTENSION_ZIP, DISTRO_CLOUD_INSTALL_SH, DISTRO_CLOUD_URL, GITHUB_URL } from "@/distribution/links";

const steps = [
  {
    title: "Install",
    body: "Use drag-and-drop on Chromium, or paste the terminal installer when drop targets are blocked. Both pull the same package from Google Cloud Storage.",
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
        Distro: <a className="underline" href={DISTRO_CLOUD_URL}>{DISTRO_CLOUD_URL}</a>
        {" · "}
        Source: <a className="underline" href={GITHUB_URL}>{GITHUB_URL}</a>
        {" · "}
        Installer: <a className="underline" href={DISTRO_CLOUD_INSTALL_SH}>install.sh</a>
        {" · "}
        Extension: <a className="underline" href={DISTRO_CLOUD_EXTENSION_ZIP}>zip</a>
      </li>
    </ol>
  );
}
