"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { DEFAULT_COUNTRY, type Country } from "@/lib/countries";
import { formatForDisplay, onlyDigits, toE164 } from "@/lib/phone";
import { analyzeMessage, MAX_MESSAGE_LENGTH } from "@/lib/sms";
import CountrySelect from "./CountrySelect";
import {
  AlertIcon,
  CheckIcon,
  FlaskIcon,
  MessageIcon,
  SendIcon,
  SpinnerIcon,
} from "./Icons";
import { useSpecular } from "./useSpecular";

type SendResponse = {
  ok: boolean;
  message?: string;
  textId?: string;
  quotaRemaining?: number | null;
  test?: boolean;
  segments?: number;
};

type Outcome =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; textId: string; test: boolean; segments: number }
  | { kind: "error"; message: string };

type DeliveryState = "SENDING" | "SENT" | "DELIVERED" | "FAILED" | "UNKNOWN";

const DELIVERY_LABEL: Record<DeliveryState, string> = {
  SENDING: "In consegna…",
  SENT: "Consegnato all’operatore",
  DELIVERED: "Consegnato al destinatario",
  FAILED: "Consegna fallita",
  UNKNOWN: "Stato non disponibile",
};

export default function SmsComposer() {
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [testMode, setTestMode] = useState(true);
  const [outcome, setOutcome] = useState<Outcome>({ kind: "idle" });
  const [delivery, setDelivery] = useState<DeliveryState | null>(null);
  const [quota, setQuota] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);

  const onSpecularMove = useSpecular<HTMLDivElement>();
  const phoneId = useId();
  const messageId = useId();
  const abortRef = useRef<AbortController | null>(null);

  const parsed = useMemo(
    () => toE164(country.dial, phone),
    [country.dial, phone],
  );
  const info = useMemo(() => analyzeMessage(message), [message]);

  const canSend =
    parsed.valid &&
    message.trim().length > 0 &&
    message.length <= MAX_MESSAGE_LENGTH &&
    outcome.kind !== "sending";

  const refreshQuota = useCallback(() => {
    // Informazione accessoria: se non arriva, l'interfaccia resta usabile.
    fetch("/api/quota", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { quotaRemaining: number | null }) =>
        setQuota(data.quotaRemaining),
      )
      .catch(() => setQuota(null));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/quota", { cache: "no-store", signal: controller.signal })
      .then((response) => response.json())
      .then((data: { quotaRemaining: number | null }) =>
        setQuota(data.quotaRemaining),
      )
      .catch(() => {});
    return () => controller.abort();
  }, []);

  // Annulla eventuali richieste in volo allo smontaggio.
  useEffect(() => () => abortRef.current?.abort(), []);

  // Dopo un invio reale interroga lo stato di consegna, con backoff crescente.
  useEffect(() => {
    if (outcome.kind !== "sent" || outcome.test || !outcome.textId) return;

    let cancelled = false;
    let attempt = 0;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      attempt += 1;
      try {
        const response = await fetch(`/api/status/${outcome.textId}`, {
          cache: "no-store",
        });
        const data = (await response.json()) as { status: DeliveryState };
        if (cancelled) return;
        setDelivery(data.status);
        if (data.status === "DELIVERED" || data.status === "FAILED") return;
      } catch {
        if (cancelled) return;
      }
      if (attempt < 6) timer = setTimeout(poll, 3000 + attempt * 1500);
    };

    timer = setTimeout(poll, 2500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [outcome]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!parsed.valid || !message.trim()) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setDelivery(null);
    setOutcome({ kind: "sending" });

    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: parsed.e164,
          message,
          test: testMode,
        }),
        signal: controller.signal,
      });

      const data = (await response.json()) as SendResponse;

      if (!response.ok || !data.ok) {
        setOutcome({
          kind: "error",
          message: data.message ?? "Invio non riuscito. Riprova.",
        });
      } else {
        setOutcome({
          kind: "sent",
          textId: data.textId ?? "",
          test: Boolean(data.test),
          segments: data.segments ?? info.segments,
        });
        if (!data.test) setDelivery("SENDING");
        setMessage("");
        setTouched(false);
      }

      if (typeof data.quotaRemaining === "number") {
        setQuota(data.quotaRemaining);
      } else if (!testMode) {
        refreshQuota();
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      setOutcome({
        kind: "error",
        message: "Connessione non riuscita. Controlla la rete e riprova.",
      });
    }
  };

  const phoneError = touched && !parsed.valid ? parsed.error : null;
  const messageError =
    touched && message.trim().length === 0 ? "Scrivi un messaggio." : null;

  return (
    <div
      onPointerMove={onSpecularMove}
      className="glass glass--specular rise w-full p-6 sm:p-8"
    >
      <div className="relative z-10">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Componi il messaggio
            </h2>
            <p className="mt-1 text-sm text-white/55">
              Formato internazionale, consegna in tempo reale.
            </p>
          </div>
          <span className="chip" title="Crediti residui sul gateway">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                quota === null
                  ? "bg-white/40"
                  : quota > 0
                    ? "bg-emerald-400 pulse-dot"
                    : "bg-amber-400"
              }`}
            />
            {quota === null ? "quota n/d" : `${quota} credit${quota === 1 ? "o" : "i"}`}
          </span>
        </header>

        <form onSubmit={submit} noValidate className="space-y-5">
          <div>
            <label
              htmlFor={phoneId}
              className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/50"
            >
              Destinatario
            </label>
            <div className="grid grid-cols-[minmax(7.5rem,auto)_1fr] gap-3">
              <CountrySelect value={country} onChange={setCountry} />
              <input
                id={phoneId}
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                value={phone}
                onChange={(e) => setPhone(onlyDigits(e.target.value).slice(0, 14))}
                onBlur={() => setTouched(true)}
                placeholder="333 123 4567"
                aria-invalid={Boolean(phoneError)}
                aria-describedby={phoneError ? `${phoneId}-error` : undefined}
                className={`field ${phoneError ? "field--invalid" : ""}`}
              />
            </div>

            <div className="mt-2 flex min-h-5 items-center justify-between gap-3 text-xs">
              {phoneError ? (
                <span id={`${phoneId}-error`} className="text-red-300">
                  {phoneError}
                </span>
              ) : (
                <span className="font-mono text-white/45">
                  {parsed.valid
                    ? formatForDisplay(parsed.e164, country.dial)
                    : " "}
                </span>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor={messageId}
              className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/50"
            >
              Messaggio
            </label>
            <textarea
              id={messageId}
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
              onBlur={() => setTouched(true)}
              rows={4}
              placeholder="Scrivi qui il tuo messaggio..."
              aria-invalid={Boolean(messageError)}
              className={`field scroll-glass resize-none ${
                messageError ? "field--invalid" : ""
              }`}
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
              {messageError ? (
                <span className="text-red-300">{messageError}</span>
              ) : (
                <span className="text-white/40">
                  {info.encoding === "UCS-2"
                    ? "Caratteri speciali: il messaggio usa la codifica UCS-2 (70 caratteri per SMS)."
                    : "Codifica standard GSM-7 (160 caratteri per SMS)."}
                </span>
              )}
              <span className="ml-auto font-mono text-white/55">
                {info.units}/{info.capacity || 160}
                {info.segments > 1 && (
                  <span className="ml-2 text-amber-300/90">
                    {info.segments} SMS
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-white/10 bg-white/4 p-3">
            <button
              type="button"
              role="switch"
              aria-checked={testMode}
              aria-label="Modalità test"
              data-on={testMode}
              onClick={() => setTestMode((t) => !t)}
              className="switch"
            />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <FlaskIcon className="h-4 w-4 text-cyan-300" />
                Modalità test
              </p>
              <p className="mt-0.5 text-xs text-white/50">
                {testMode
                  ? "Simula l’invio: nessun SMS parte e nessun credito viene consumato."
                  : "Invio reale: consuma un credito del gateway."}
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSend}
            className="btn btn--primary w-full"
          >
            {outcome.kind === "sending" ? (
              <>
                <SpinnerIcon className="spin h-5 w-5" />
                Invio in corso...
              </>
            ) : (
              <>
                <SendIcon className="h-5 w-5" />
                {testMode ? "Simula invio" : "Invia SMS"}
              </>
            )}
          </button>
        </form>

        {/* Esito: annunciato agli screen reader senza rubare il focus. */}
        <div aria-live="polite" className="mt-4 empty:mt-0">
          {outcome.kind === "sent" && (
            <div className="pop rounded-[var(--radius-md)] border border-emerald-400/25 bg-emerald-400/10 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-200">
                <CheckIcon className="h-4 w-4" />
                {outcome.test
                  ? "Simulazione completata con successo"
                  : `Messaggio inviato${outcome.segments > 1 ? ` (${outcome.segments} SMS)` : ""}`}
              </p>
              <p className="mt-1 text-xs text-emerald-100/70">
                {outcome.test
                  ? "Il gateway ha accettato la richiesta. Disattiva la modalità test per l’invio reale."
                  : delivery
                    ? DELIVERY_LABEL[delivery]
                    : "Consegna in corso..."}
              </p>
            </div>
          )}

          {outcome.kind === "error" && (
            <div className="pop rounded-[var(--radius-md)] border border-red-400/25 bg-red-400/10 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-red-200">
                <AlertIcon className="h-4 w-4" />
                Invio non riuscito
              </p>
              <p className="mt-1 text-xs text-red-100/75">{outcome.message}</p>
            </div>
          )}
        </div>

        <p className="mt-5 flex items-center gap-2 text-[11px] leading-relaxed text-white/35">
          <MessageIcon className="h-3.5 w-3.5 flex-none" />
          Il numero non viene salvato: viene inoltrato al gateway e poi scartato.
        </p>
      </div>
    </div>
  );
}
