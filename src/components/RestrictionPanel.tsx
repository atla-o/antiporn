"use client";

import { ShieldBan } from "lucide-react";
import { useState } from "react";
import { useAntiporn } from "@/components/AntipornProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MAX_RESTRICTION_DAYS } from "@/lib/state";
import { formatDuration } from "@/lib/utils";

export function RestrictionPanel() {
  const { state, freeze, restrictionLeft, engageRestriction } = useAntiporn();
  const [days, setDays] = useState(7);
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldBan className="h-5 w-5 text-black" />
          Filter
        </CardTitle>
        <CardDescription>
          Locks Antiporn on this profile for up to {MAX_RESTRICTION_DAYS} days. Severity and vault
          settings freeze for the duration. There is no in-app disable.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {state.restriction.active ? (
          <div className="rounded-lg border border-black bg-white p-4" data-testid="active-lock">
            <p className="text-xs uppercase tracking-widest text-neutral-600">Active filter</p>
            <p className="mt-1 font-mono text-3xl">{formatDuration(restrictionLeft)}</p>
            <p className="mt-2 text-sm text-neutral-600">
              Ends {new Date(state.restriction.endsAt).toLocaleString()}. Stopping early requires a
              factory reset of this device or browser profile.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <Label>Lock length</Label>
                <span className="font-mono text-neutral-700">{days} days</span>
              </div>
              <Slider
                min={1}
                max={MAX_RESTRICTION_DAYS}
                step={1}
                value={[days]}
                onValueChange={(v) => setDays(v[0] ?? 7)}
                disabled={freeze && state.restriction.active}
              />
              <p className="text-xs text-neutral-500">1–{MAX_RESTRICTION_DAYS} days. Confirming starts a non-stoppable timer.</p>
            </div>
            <Button variant="lock" className="w-full" data-testid="engage-restriction" onClick={() => setOpen(true)}>
              Engage filter
            </Button>
          </>
        )}
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Engage {days}-day filter?</DialogTitle>
            <DialogDescription>
              Antiporn will stay enforced until the timer ends. Closing the tab does not pause it.
              The only documented abort is a factory reset of this device or a full browser-profile
              wipe. Type LOCK to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input
            data-testid="lock-confirm-input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="LOCK"
          />
          <Button
            variant="lock"
            className="w-full"
            data-testid="lock-confirm-submit"
            disabled={confirm !== "LOCK"}
            onClick={() => {
              engageRestriction(days);
              setOpen(false);
              setConfirm("");
            }}
          >
            Start {days}-day filter
          </Button>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
