import { NextResponse } from "next/server";
import { cronAuthorized, runRenewalReminders } from "@/engine/cron";

export const dynamic = "force-dynamic";

/** Called by Supabase pg_cron (see supabase/wave3-cron.sql). Bearer-protected. */
export async function POST(req: Request) {
  if (!cronAuthorized(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await runRenewalReminders();
  return NextResponse.json({ ok: true, ...result });
}
