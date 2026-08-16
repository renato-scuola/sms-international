/**
 * Normalizzazione e validazione dei numeri in formato E.164.
 *
 * Regole E.164: "+" seguito da massimo 15 cifre, prefisso incluso.
 * Non facciamo validazione per-paese (richiederebbe libphonenumber, ~500 kB):
 * ci limitiamo a un controllo strutturale robusto, il resto lo dice il gateway.
 */

export const E164_MAX_DIGITS = 15;

/**
 * Paesi in cui lo "0" iniziale fa parte del numero nazionale e non va rimosso.
 * In quasi tutto il mondo lo 0 è un prefisso interurbano da togliere quando si
 * compone in formato internazionale; l'Italia è la principale eccezione
 * (i fissi mantengono lo 0: +39 06 ...).
 */
const KEEP_LEADING_ZERO = new Set(["39"]);

export type PhoneCheck =
  | { valid: true; e164: string; nationalDigits: string }
  | { valid: false; error: string };

/** Tiene solo le cifre di una stringa. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Compone il numero internazionale a partire da prefisso e numero nazionale.
 * Rimuove lo zero interurbano dove previsto.
 */
export function toE164(dial: string, nationalInput: string): PhoneCheck {
  const dialDigits = onlyDigits(dial);
  let national = onlyDigits(nationalInput);

  if (!dialDigits) {
    return { valid: false, error: "Seleziona il prefisso internazionale." };
  }

  if (!national) {
    return { valid: false, error: "Inserisci il numero di telefono." };
  }

  if (!KEEP_LEADING_ZERO.has(dialDigits)) {
    national = national.replace(/^0+/, "");
  }

  if (national.length < 4) {
    return { valid: false, error: "Il numero è troppo corto." };
  }

  const total = dialDigits.length + national.length;
  if (total > E164_MAX_DIGITS) {
    return {
      valid: false,
      error: `Il numero è troppo lungo (max ${E164_MAX_DIGITS} cifre con il prefisso).`,
    };
  }

  return {
    valid: true,
    e164: `+${dialDigits}${national}`,
    nationalDigits: national,
  };
}

/** Valida un numero già in formato E.164 (usata anche lato server). */
export function isValidE164(value: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(value);
}

/**
 * Raggruppa le cifre in blocchi da 3 per la sola visualizzazione.
 * Il prefisso va passato esplicitamente: dedurlo dal numero non è possibile
 * (i prefissi vanno da 1 a 4 cifre e sono ambigui fra loro).
 */
export function formatForDisplay(e164: string, dial: string): string {
  const dialDigits = onlyDigits(dial);
  const national = e164.startsWith(`+${dialDigits}`)
    ? e164.slice(dialDigits.length + 1)
    : e164.replace(/^\+/, "");
  return `+${dialDigits} ${national.replace(/(\d{3})(?=\d)/g, "$1 ")}`.trim();
}

/** Oscura le cifre centrali: usato nei log server per non registrare numeri interi. */
export function maskPhone(e164: string): string {
  if (e164.length < 7) return "***";
  return `${e164.slice(0, 4)}***${e164.slice(-2)}`;
}
