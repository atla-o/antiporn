import { readLock, writeLock } from "@/lib/backend";
import { isProfileId, parseState } from "@/lib/state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!isProfileId(id)) {
    return Response.json({ error: "Invalid profile id." }, { status: 400 });
  }
  const state = await readLock(id);
  return Response.json({ state, profileId: id });
}

export async function PUT(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!isProfileId(id)) {
    return Response.json({ error: "Invalid profile id." }, { status: 400 });
  }
  const text = await req.text();
  if (text.length > 64_000) {
    return Response.json({ error: "Lock payload is too large." }, { status: 413 });
  }
  let body: unknown;
  try {
    body = JSON.parse(text) as unknown;
  } catch {
    return Response.json({ error: "Lock payload must be JSON." }, { status: 400 });
  }
  const incoming = parseState(
    body && typeof body === "object" && "state" in body ? (body as { state: unknown }).state : body,
  );
  if (!incoming) {
    return Response.json({ error: "Lock payload is not a v1 state." }, { status: 400 });
  }
  const saved = await writeLock(id, incoming);
  return Response.json({ state: saved.state, persist: saved.persist, profileId: id });
}
