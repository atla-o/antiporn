"use client";

import { AntipornProvider, useAntiporn } from "@/components/AntipornProvider";
import { ExtensionTab } from "@/components/ExtensionTab";
import { HowToUse } from "@/components/HowToUse";
import { InstallMethods } from "@/components/InstallMethods";
import { NudityPreview } from "@/components/NudityPreview";
import { RestrictionPanel } from "@/components/RestrictionPanel";
import { SeverityPanel } from "@/components/SeverityPanel";
import { TimeVaultPanel } from "@/components/TimeVaultPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDuration } from "@/lib/utils";
import { Shield } from "lucide-react";

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
  return (
    <Tabs defaultValue="get">
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
  const { ready, state, restrictionLeft, vaultLeft } = useAntiporn();

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
          <p className="text-sm text-neutral-500">Restoring lock store…</p>
        ) : (
          <Tabs defaultValue="filter">
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
