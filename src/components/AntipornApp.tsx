"use client";

import { useEffect, useState } from "react";
import { AntipornProvider, useAntiporn } from "@/components/AntipornProvider";
import { ExtensionTab } from "@/components/ExtensionTab";
import { FlowNote } from "@/components/FlowNote";
import { HowToUse } from "@/components/HowToUse";
import { InstallMethods } from "@/components/InstallMethods";
import { NudityPreview } from "@/components/NudityPreview";
import { RestrictionPanel } from "@/components/RestrictionPanel";
import { SeverityPanel } from "@/components/SeverityPanel";
import { TimeVaultPanel } from "@/components/TimeVaultPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDuration } from "@/lib/utils";
import { Shield } from "lucide-react";

const TOP_TABS = ["filter", "vault", "install"] as const;
const INSTALL_TABS = ["get", "preview", "extension"] as const;

function parseHash() {
  const raw = typeof window === "undefined" ? "" : window.location.hash.replace(/^#/, "");
  const [topRaw, nestedRaw] = raw.split("/");
  const top = TOP_TABS.includes(topRaw as (typeof TOP_TABS)[number]) ? topRaw : "filter";
  const nested = INSTALL_TABS.includes(nestedRaw as (typeof INSTALL_TABS)[number]) ? nestedRaw : "get";
  return { top, nested };
}

function CapOverlay() {
  const { capReached } = useAntiporn();
  if (!capReached) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/95 p-6">
      <div className="max-w-md rounded-xl border border-black bg-white p-6 text-center">
        <p className="text-xs uppercase tracking-widest text-neutral-600">Daily cap</p>
        <h2 className="mt-2 text-2xl font-semibold">Usage locked for the rest of today</h2>
        <p className="mt-2 text-sm text-neutral-600">
          The time vault daily cap is spent. This screen stays up until local midnight. A factory
          reset of the device is the documented abort.
        </p>
      </div>
    </div>
  );
}

function InstallHub({ embed }: { embed?: boolean }) {
  const [tab, setTab] = useState("get");

  useEffect(() => {
    const apply = () => setTab(parseHash().nested);
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        setTab(value);
        window.history.replaceState(null, "", `#install/${value}`);
      }}
    >
      <TabsList>
        <TabsTrigger value="get">Get Antiporn</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="extension">Extension</TabsTrigger>
      </TabsList>
      <TabsContent value="get">
        <InstallMethods />
      </TabsContent>
      <TabsContent value="preview" className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-3">
          <p className="text-sm text-neutral-600">
            Live Antiporn in this page so a site can ship one iframe. How to use sits beside it.
          </p>
          {embed ? (
            <NudityPreview />
          ) : (
            <iframe
              title="Antiporn preview"
              src="/embed"
              className="h-[720px] w-full rounded-xl border border-neutral-300 bg-white"
            />
          )}
        </div>
        <div className="lg:col-span-2">
          <h2 className="mb-3 font-semibold">How to use</h2>
          <HowToUse />
        </div>
      </TabsContent>
      <TabsContent value="extension">
        <ExtensionTab />
      </TabsContent>
    </Tabs>
  );
}

function Shell({ embed }: { embed?: boolean }) {
  const { ready, storeWarning, state, restrictionLeft, vaultLeft } = useAntiporn();
  const [tab, setTab] = useState("filter");

  useEffect(() => {
    const apply = () => setTab(parseHash().top);
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black">
      <CapOverlay />
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-black text-white">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">Antiporn</p>
              <p className="text-xs text-neutral-500">Filter · nudity squares · time vault</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-md border border-neutral-300 px-2 py-1 font-mono">
              {state.restriction.active ? `Filter ${formatDuration(restrictionLeft)}` : "Filter off"}
            </span>
            <span className="rounded-md border border-neutral-300 px-2 py-1 font-mono">
              {state.vault.active ? `Vault ${formatDuration(vaultLeft)}` : "Vault off"}
            </span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        {!ready ? (
          <FlowNote tone="loading" testId="store-loading">
            Restoring lock store…
          </FlowNote>
        ) : (
          <>
            {storeWarning && (
              <div className="mb-4">
                <FlowNote tone="error" testId="store-error">
                  {storeWarning}
                </FlowNote>
              </div>
            )}
            <Tabs
              value={tab}
              onValueChange={(value) => {
                setTab(value);
                const nested = value === "install" ? `/${parseHash().nested}` : "";
                window.history.replaceState(null, "", `#${value}${nested}`);
              }}
            >
              <TabsList>
                <TabsTrigger value="filter">Filter</TabsTrigger>
                <TabsTrigger value="vault">Time vault</TabsTrigger>
                <TabsTrigger value="install">Install</TabsTrigger>
              </TabsList>
              <TabsContent value="filter" className="grid gap-4 lg:grid-cols-2">
                <RestrictionPanel />
                <SeverityPanel />
                <div className="lg:col-span-2">
                  <NudityPreview />
                </div>
              </TabsContent>
              <TabsContent value="vault">
                <TimeVaultPanel />
              </TabsContent>
              <TabsContent value="install">
                <InstallHub embed={embed} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}

export function AntipornApp({ embed }: { embed?: boolean }) {
  return (
    <AntipornProvider>
      <Shell embed={embed} />
    </AntipornProvider>
  );
}
