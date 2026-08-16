/**
 * Client server-side per Textbelt (https://textbelt.com).
 *
 * Perché Textbelt: è l’unico gateway SMS con un piano davvero gratuito e senza
 * registrazione. La chiave pubblica "textbelt" concede 1 SMS al giorno per
 * indirizzo IP. Aggiungendo il suffisso "_test" alla chiave la richiesta viene
 * simulata: risposta reale, nessun SMS inviato, nessun credito consumato.
 *
 * Se in futuro si acquista una chiave a pagamento basta valorizzare TEXTBELT_KEY:
 * il resto del codice non cambia.
 */

import { maskPhone } from "./phone";

/** Sovrascrivibile con TEXTBELT_API_BASE per puntare a un gateway simulato nei test. */
const API_BASE =
  process.env.TEXTBELT_API_BASE?.replace(/\/+$/, "") || "https://textbelt.com";
const TIMEOUT_MS = 12_000;

/** Chiave gratuita pubblica di Textbelt: 1 SMS al giorno per IP. */
export const FREE_KEY = "textbelt";

export function getApiKey(): string {
  return process.env.TEXTBELT_KEY?.trim() || FREE_KEY;
}

export function isFreeTier(): boolean {
  return getApiKey() === FREE_KEY;
}

export type SendOutcome =
  | { ok: true; textId: string; quotaRemaining: number | null; test: boolean }
  | { ok: false; code: ErrorCode; message: string; quotaRemaining: number | null };

export type ErrorCode =
  | "QUOTA"
  | "INVALID_PHONE"
  | "PROVIDER"
  | "NETWORK"
  | "TIMEOUT";

type TextbeltResponse = {
  success?: boolean;
  quotaRemaining?: number;
  textId?: string;
  error?: string;
};

/** fetch con timeout: evita che la funzione serverless resti appesa. */
async function fetchJson(
  url: string,
  init?: RequestInit,
): Promise<TextbeltResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
    });
    const text = await response.text();
    try {
      return JSON.parse(text) as TextbeltResponse;
    } catch {
      throw new Error(
        `Risposta non valida dal gateway (HTTP ${response.status}).`,
      );
    }
  } finally {
    clearTimeout(timer);
  }
}

/** Traduce in italiano gli errori del gateway, che arrivano in inglese. */
function translateError(raw: string | undefined): {
  code: ErrorCode;
  message: string;
} {
  const error = (raw ?? "").toLowerCase();

  if (error.includes("quota") || error.includes("out of")) {
    return {
      code: "QUOTA",
      message:
        "Quota gratuita esaurita: il piano free consente 1 SMS al giorno per indirizzo IP. Riprova domani oppure usa la modalità test.",
    };
  }
  if (error.includes("phone") || error.includes("number")) {
    return {
      code: "INVALID_PHONE",
      message:
        "Il gateway ha rifiutato il numero. Controlla prefisso e cifre (formato internazionale).",
    };
  }
  return {
    code: "PROVIDER",
    message: raw
      ? `Il gateway ha risposto: ${raw}`
      : "Il gateway non è riuscito a inviare il messaggio.",
  };
}

function networkFailure(error: unknown): {
  code: ErrorCode;
  message: string;
} {
  if (error instanceof Error && error.name === "AbortError") {
    return {
      code: "TIMEOUT",
      message: "Il gateway non ha risposto in tempo. Riprova tra poco.",
    };
  }
  return {
    code: "NETWORK",
    message: "Impossibile contattare il gateway SMS. Riprova tra poco.",
  };
}

/**
 * Invia un SMS.
 * @param test se true la richiesta è simulata e non consuma quota.
 */
export async function sendSms(
  phone: string,
  message: string,
  test: boolean,
): Promise<SendOutcome> {
  const key = test ? `${getApiKey()}_test` : getApiKey();

  try {
    const result = await fetchJson(`${API_BASE}/text`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ phone, message, key }).toString(),
    });

    const quotaRemaining =
      typeof result.quotaRemaining === "number" ? result.quotaRemaining : null;

    if (result.success) {
      console.log(
        `SMS ${test ? "simulato" : "inviato"} -> ${maskPhone(phone)} (id: ${result.textId ?? "n/d"})`,
      );
      return {
        ok: true,
        textId: String(result.textId ?? ""),
        quotaRemaining,
        test,
      };
    }

    const { code, message: translated } = translateError(result.error);
    console.warn(`Invio fallito -> ${maskPhone(phone)}: ${result.error}`);
    return { ok: false, code, message: translated, quotaRemaining };
  } catch (error) {
    const failure = networkFailure(error);
    console.error(`Errore di rete verso il gateway: ${String(error)}`);
    return { ...failure, ok: false, quotaRemaining: null };
  }
}

export type QuotaOutcome = {
  quotaRemaining: number | null;
  freeTier: boolean;
  available: boolean;
};

/** Legge la quota residua associata alla chiave (e quindi all'IP, sul piano free). */
export async function getQuota(): Promise<QuotaOutcome> {
  try {
    const result = await fetchJson(`${API_BASE}/quota/${getApiKey()}`);
    return {
      quotaRemaining:
        typeof result.quotaRemaining === "number" ? result.quotaRemaining : null,
      freeTier: isFreeTier(),
      available: true,
    };
  } catch {
    return { quotaRemaining: null, freeTier: isFreeTier(), available: false };
  }
}

export type DeliveryStatus =
  | "DELIVERED"
  | "SENT"
  | "SENDING"
  | "FAILED"
  | "UNKNOWN";

/** Stato di consegna di un messaggio già inviato. */
export async function getStatus(textId: string): Promise<DeliveryStatus> {
  try {
    const result = (await fetchJson(
      `${API_BASE}/status/${encodeURIComponent(textId)}`,
    )) as { status?: string };
    const status = String(result.status ?? "").toUpperCase();
    return (
      ["DELIVERED", "SENT", "SENDING", "FAILED"].includes(status)
        ? status
        : "UNKNOWN"
    ) as DeliveryStatus;
  } catch {
    return "UNKNOWN";
  }
}
