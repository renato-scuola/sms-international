import { NextResponse } from "next/server";

import { getQuota } from "@/lib/textbelt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

/** Quota residua della chiave in uso: sul piano free equivale al credito dell'IP del server. */
export async function GET() {
  const quota = await getQuota();
  return NextResponse.json(quota);
}
