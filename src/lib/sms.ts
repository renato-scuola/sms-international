/**
 * Calcolo dei segmenti SMS secondo lo standard 3GPP 23.038.
 *
 * Se tutti i caratteri appartengono all'alfabeto GSM 03.38 il messaggio viaggia
 * a 7 bit (160 caratteri, 153 per segmento se concatenato). Basta un carattere
 * fuori alfabeto (emoji, cirillico, virgolette curve...) per passare a UCS-2
 * (70 caratteri, 67 per segmento).
 */

export const MAX_MESSAGE_LENGTH = 918; // 6 segmenti UCS-2: limite pratico di invio

const GSM_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?" +
  "¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";

/** Caratteri che nel GSM 03.38 occupano 2 posizioni (escape sequence). */
const GSM_EXTENDED = "^{}\\[~]|€";

const GSM_BASIC_SET = new Set(GSM_BASIC.split(""));
const GSM_EXTENDED_SET = new Set(GSM_EXTENDED.split(""));

export type Encoding = "GSM-7" | "UCS-2";

export type SegmentInfo = {
  encoding: Encoding;
  /** Lunghezza "pesata": i caratteri estesi GSM contano doppio. */
  units: number;
  /** Numero di SMS effettivamente inviati (e quindi di crediti consumati). */
  segments: number;
  /** Unita' ancora disponibili nel segmento corrente. */
  remaining: number;
  /** Capienza totale con il numero di segmenti attuale. */
  capacity: number;
};

function isGsm7(text: string): boolean {
  for (const char of text) {
    if (!GSM_BASIC_SET.has(char) && !GSM_EXTENDED_SET.has(char)) return false;
  }
  return true;
}

export function analyzeMessage(text: string): SegmentInfo {
  const gsm = isGsm7(text);

  let units = 0;
  if (gsm) {
    for (const char of text) units += GSM_EXTENDED_SET.has(char) ? 2 : 1;
  } else {
    // UCS-2: i caratteri fuori dal BMP (es. molte emoji) occupano 2 unita'.
    units = text.length;
  }

  const single = gsm ? 160 : 70;
  const multi = gsm ? 153 : 67;

  const segments = units === 0 ? 0 : units <= single ? 1 : Math.ceil(units / multi);
  const capacity = segments <= 1 ? single : segments * multi;

  return {
    encoding: gsm ? "GSM-7" : "UCS-2",
    units,
    segments,
    remaining: capacity - units,
    capacity,
  };
}
