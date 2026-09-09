"use client";

import { TimerReset } from "lucide-react";
import { useState } from "react";
import { useAntiporn } from "@/components/AntipornProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { MAX_DAILY_CAP_HOURS, MAX_VAULT_DAYS } from "@/lib/state";
import { formatClock, formatDuration, msUntilTomorrow } from "@/lib/utils";

export function TimeVaultPanel() {
  const { state, vaultLeft, capReached, engageVault } = useAntiporn();
  const [days, setDays] = useState(1);
  const [capHours, setCapHours] = useState(3);
  const [useCap, setUseCap] = useState(true);
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");

  const capMs = (state.vault.dailyCapMinutes ?? 0) * 60_000;
  const usedPct = capMs ? Math.min(100, (state.usage.usedMs / capMs) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TimerReset className="h-5 w-5 text-black" />
          Time vault
        </CardTitle>
        <CardDescription>
          Relapse lock: a timer up to {MAX_VAULT_DAYS} days that cannot be stopped from inside
          Antiporn. Optional daily usage cap (for example 3 hours) seals the rest of the calendar day.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {state.vault.active ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-black bg-white p-4">
              <p className="text-xs uppercase tracking-widest text-neutral-600">Vault running</p>
              <p className="mt-1 font-mono text-3xl">{formatDuration(vaultLeft)}</p>
              <p className="mt-2 text-sm text-neutral-600">
                No stop control exists. Factory reset is the abort path if you need it.
              </p>
            </div>
            {state.vault.dailyCapMinutes != null && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Daily usage</span>
                  <span className="font-mono">
                    {formatClock(state.usage.usedMs)} / {formatClock(capMs)}
                  </span>
                </div>
                <Progress value={usedPct} />
                {capReached ? (
                  <p className="text-sm text-black">
                    Daily cap reached. Access returns in {formatDuration(msUntilTomorrow())}.
                  </p>
                ) : (
                  <p className="text-xs text-neutral-500">Visible time on this profile counts toward the cap.</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <Label>Vault length</Label>
                <span className="font-mono">{days} day{days === 1 ? "" : "s"}</span>
              </div>
              <Slider min={1} max={MAX_VAULT_DAYS} step={1} value={[days]} onValueChange={(v) => setDays(v[0] ?? 1)} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={useCap}
                onChange={(e) => setUseCap(e.target.checked)}
                className="accent-white"
              />
              Enforce a daily usage cap
            </label>
            {useCap && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label>Daily cap</Label>
                  <span className="font-mono">{capHours} hour{capHours === 1 ? "" : "s"}</span>
                </div>
                <Slider
                  min={1}
                  max={MAX_DAILY_CAP_HOURS}
                  step={1}
                  value={[capHours]}
                  onValueChange={(v) => setCapHours(v[0] ?? 3)}
                />
              </div>
            )}
            <Button variant="lock" className="w-full" data-testid="seal-vault" onClick={() => setOpen(true)}>
              Seal the vault
            </Button>
          </>
        )}
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seal a {days}-day vault?</DialogTitle>
            <DialogDescription>
              The countdown will not pause if you quit Antiporn. There is no stop button. Type VAULT
              to start.
              {useCap ? ` Daily cap: ${capHours} hours.` : ""}
            </DialogDescription>
          </DialogHeader>
          <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="VAULT" />
          <Button
            variant="lock"
            className="w-full"
            disabled={confirm !== "VAULT"}
            onClick={() => {
              engageVault(days, useCap ? capHours * 60 : null);
              setOpen(false);
              setConfirm("");
            }}
          >
            Start vault
          </Button>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
