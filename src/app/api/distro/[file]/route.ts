import { readDistro } from "@/lib/backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ file: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { file } = await ctx.params;
  const artifact = await readDistro(file);
  if (!artifact) {
    return Response.json({ error: "Unknown or missing install file." }, { status: 404 });
  }
  return new Response(new Uint8Array(artifact.body), {
    headers: {
      "Content-Type": artifact.contentType,
      "Content-Disposition": `attachment; filename="${artifact.file}"`,
      "Cache-Control": "public, max-age=300",
      "X-Antiporn-Distro": artifact.source,
    },
  });
}

export async function HEAD(_req: Request, ctx: Ctx) {
  const { file } = await ctx.params;
  const artifact = await readDistro(file);
  if (!artifact) return new Response(null, { status: 404 });
  return new Response(null, {
    headers: {
      "Content-Type": artifact.contentType,
      "Content-Length": String(artifact.body.byteLength),
      "X-Antiporn-Distro": artifact.source,
    },
  });
}
