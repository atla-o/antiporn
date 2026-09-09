"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { detectNudity, downscaleForDetect, type Box } from "@/lib/detector";
import { useAntiporn } from "@/components/AntipornProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function paintDemo(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const w = (canvas.width = 640);
  const h = (canvas.height = 400);
  ctx.fillStyle = "#1a1512";
  ctx.fillRect(0, 0, w, h);
  const tones = ["#e0b090", "#c68642", "#8d5524", "#f1c27d"];
  const blobs = [
    { x: 220, y: 90, rx: 70, ry: 90, t: 0 },
    { x: 400, y: 120, rx: 55, ry: 80, t: 1 },
    { x: 310, y: 250, rx: 90, ry: 50, t: 2 },
    { x: 160, y: 280, rx: 40, ry: 55, t: 3 },
  ];
  blobs.forEach((b) => {
    ctx.fillStyle = tones[b.t];
    ctx.beginPath();
    ctx.ellipse(b.x, b.y, b.rx, b.ry, 0.2, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawBoxes(ctx: CanvasRenderingContext2D, boxes: Box[]) {
  for (const box of boxes) {
    ctx.fillStyle = "rgba(12, 12, 14, 0.94)";
    ctx.fillRect(box.x, box.y, box.size, box.size);
    ctx.strokeStyle = box.kind === "explicit" ? "#ffffff" : "#737373";
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x, box.y, box.size, box.size);
    ctx.fillStyle = "#a1a1aa";
    ctx.font = "11px ui-monospace, monospace";
    ctx.fillText(box.kind === "explicit" ? "BLOCK" : "SKIN", box.x + 6, box.y + 16);
  }
}

export function NudityPreview() {
  const { state } = useAntiporn();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<HTMLCanvasElement | HTMLImageElement | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [stats, setStats] = useState("Drop an image or generate a skin-tone fixture.");
  const [error, setError] = useState<string | null>(null);

  const runDetect = useCallback(() => {
    const canvas = canvasRef.current;
    const source = sourceRef.current;
    if (!canvas || !source) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { image, width, height } = downscaleForDetect(source);
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(source, 0, 0, width, height);
    const result = detectNudity(image, state.severity, width, height);
    drawBoxes(ctx, result.boxes);
    setNotes(result.notes);
    setStats(
      `${result.boxes.length} square${result.boxes.length === 1 ? "" : "s"} · skin ${(result.skinRatio * 100).toFixed(1)}% · ${result.explicitLikely ? "explicit-likely" : "not explicit-likely"}`,
    );
  }, [state.severity]);

  useEffect(() => {
    runDetect();
  }, [runDetect]);

  function loadDemo() {
    const c = document.createElement("canvas");
    paintDemo(c);
    sourceRef.current = c;
    setError(null);
    requestAnimationFrame(runDetect);
  }

  function onFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Use an image file.");
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      sourceRef.current = img;
      setError(null);
      runDetect();
      URL.revokeObjectURL(url);
    };
    img.onerror = () => setError("Could not read that image.");
    img.src = url;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nudity squares</CardTitle>
        <CardDescription>
          Opaque squares cover skin clusters. Move severity and re-check. For real explicit stills,
          the high-recall rule forces a box even at the hard end of the slider.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-neutral-400 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-600"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) onFile(f);
          }}
          onClick={() => document.getElementById("nudity-file")?.click()}
        >
          Drop a still here, or click to choose. Nothing is uploaded.
          <input
            id="nudity-file"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" data-testid="generate-skin-fixture" onClick={loadDemo}>
            Generate skin fixture
          </Button>
        </div>
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
          <canvas ref={canvasRef} data-testid="nudity-canvas" className="max-h-[420px] w-full object-contain" />
        </div>
        <p className="font-mono text-xs text-neutral-600" data-testid="nudity-stats">
          {stats}
        </p>
        {notes.map((n) => (
          <p key={n} className="text-sm text-black">
            {n}
          </p>
        ))}
        {error && <p className="text-sm text-neutral-700">{error}</p>}
      </CardContent>
    </Card>
  );
}
