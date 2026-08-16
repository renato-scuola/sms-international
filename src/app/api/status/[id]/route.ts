import { NextResponse } from "next/server";

import { getStatus } from "@/lib/textbelt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

/** Stato di consegna di un SMS già inviato, interrogato tramite il textId. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id || !/^[\w-]{1,64}$/.test(id)) {
    return NextResponse.json(
      { status: "UNKNOWN", message: "Identificativo non valido." },
      { status: 400 },
    );
  }

  const status = await getStatus(id);
  return NextResponse.json({ status });
}
