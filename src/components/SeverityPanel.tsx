"use client";

import { useAntiporn } from "@/components/AntipornProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

export function SeverityPanel() {
  const { state, freeze, changeSeverity } = useAntiporn();
  const v = state.severity;
  const label =
    v < 25 ? "Soft — exposed skin and lingerie-scale coverage" :
    v < 55 ? "Mixed — skin plus compact body clusters" :
    v < 80 ? "Firm — genital-scale clusters, still never skips porn framing" :
    "Hard — genital-scale only, explicit frames still always boxed";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Severity</CardTitle>
        <CardDescription>
          Soft treats showable skin as block-worthy. Hard waits for genital-scale clusters. Actual
          porn composition is always squared — the detector is not allowed to miss it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-xs uppercase tracking-wider text-neutral-500">
          <span>Soft porn / skin</span>
          <span>Hard porn / genital</span>
        </div>
        <Slider
          min={0}
          max={100}
          step={1}
          value={[v]}
          onValueChange={(val) => changeSeverity(val[0] ?? 0)}
          disabled={freeze}
        />
        <p className="text-sm text-neutral-700">{label}</p>
        {freeze && (
          <p className="text-xs text-neutral-600">Severity is frozen while a filter or vault is active.</p>
        )}
      </CardContent>
    </Card>
  );
}
