import { NextResponse } from "next/server";

import { isValidE164 } from "@/lib/phone";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { analyzeMessage, MAX_MESSAGE_LENGTH } from "@/lib/sms";
import { isFreeTier, sendSms } from "@/lib/textbelt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

/** Invii reali consentiti per IP in 10 minuti (la quota vera la impone il gateway). */
const SEND_LIMIT = 4;
/** Le simulazioni non costano nulla, quindi hanno un limite più generoso. */
const TEST_LIMIT = 20;
const WINDOW_MS = 10 * 60 * 1000;

function bad(message: string, status: number, code: string) {
  return NextResponse.json({ ok: false, code, message }, { status });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return bad("Richiesta non valida.", 400, "BAD_REQUEST");
  }

  const { phone, message, test } = (payload ?? {}) as {
    phone?: unknown;
    message?: unknown;
    test?: unknown;
  };

  if (typeof phone !== "string" || !isValidE164(phone)) {
    return bad(
      "Numero non valido: serve il formato internazionale, es. +393331234567.",
      400,
      "INVALID_PHONE",
    );
  }

  if (typeof message !== "string" || message.trim().length === 0) {
    return bad("Il messaggio non può essere vuoto.", 400, "EMPTY_MESSAGE");
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return bad(
      `Messaggio troppo lungo (max ${MAX_MESSAGE_LENGTH} caratteri).`,
      400,
      "MESSAGE_TOO_LONG",
    );
  }

  const simulate = test === true;
  const ip = clientIp(request.headers);
  const limit = rateLimit(
    `${simulate ? "test" : "send"}:${ip}`,
    simulate ? TEST_LIMIT : SEND_LIMIT,
    WINDOW_MS,
  );

  if (!limit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        code: "RATE_LIMITED",
        message: `Troppi tentativi ravvicinati. Riprova tra ${limit.retryAfter} secondi.`,
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const info = analyzeMessage(message);
  const outcome = await sendSms(phone, message, simulate);

  if (!outcome.ok) {
    // 502: l'errore arriva dal gateway a valle, non dal client.
    const status = outcome.code === "QUOTA" ? 429 : 502;
    return NextResponse.json(
      {
        ok: false,
        code: outcome.code,
        message: outcome.message,
        quotaRemaining: outcome.quotaRemaining,
      },
      { status },
    );
  }

  return NextResponse.json({
    ok: true,
    textId: outcome.textId,
    quotaRemaining: outcome.quotaRemaining,
    test: outcome.test,
    freeTier: isFreeTier(),
    segments: info.segments,
    encoding: info.encoding,
  });
}
