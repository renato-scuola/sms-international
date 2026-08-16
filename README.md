# SMS Internazionale

Applicazione web per l'invio di SMS internazionali, con interfaccia **liquid glass**
e un percorso di invio che funziona davvero: nessun trucco, nessuna finzione.

Costruita con Next.js 16 (App Router), React 19 e Tailwind CSS 4.
**Zero dipendenze runtime oltre a Next e React**: form, validazione, selettore paesi,
animazioni e icone sono scritti a mano.

---

## Come funziona l'invio

L'app usa [Textbelt](https://textbelt.com), l'unico gateway SMS con un piano
gratuito che non richiede registrazione.

| Modalità | Chiave usata | Costo | Cosa succede |
| --- | --- | --- | --- |
| **Test** (predefinita) | `textbelt_test` | gratis, illimitata | Il gateway valida e risponde come per un invio reale, ma nessun SMS parte e nessun credito viene consumato. |
| **Reale** | `textbelt` | 1 SMS al giorno per IP | L'SMS viene consegnato davvero. |
| **Reale con chiave propria** | valore di `TEXTBELT_KEY` | a consumo | Invii illimitati fino ai crediti acquistati. |

### Il limite del piano gratuito, detto chiaramente

La quota gratuita è **1 SMS al giorno per indirizzo IP**, e l'IP che conta è quello
del **server**, non del visitatore. Su un sito pubblicato significa: **un solo SMS
reale al giorno per l'intero sito**, condiviso da tutti i visitatori.

Non esiste un modo lecito di aggirare questo limite — provare chiavi inventate
(`demo`, `free`, `test`…) o ruotare gli IP non funziona e viola i termini del
servizio. Per un uso reale servono crediti Textbelt: si acquistano una volta e si
impostano in `TEXTBELT_KEY`, senza toccare il codice.

La **modalità test** esiste proprio per questo: permette di usare e mostrare
l'applicazione senza limiti e senza costi.

---

## Avvio in locale

```bash
npm install
npm run dev            # http://localhost:3000
```

Nessuna configurazione è necessaria per iniziare: senza `TEXTBELT_KEY` l'app usa
la chiave gratuita pubblica.

Per usare una chiave propria:

```bash
cp .env.example .env.local
# poi valorizza TEXTBELT_KEY
```

### Script disponibili

| Comando | Descrizione |
| --- | --- |
| `npm run dev` | Server di sviluppo |
| `npm run build` | Build di produzione |
| `npm start` | Avvia la build di produzione |
| `npm run lint` | ESLint (flat config di Next) |
| `npm run typecheck` | Controllo dei tipi TypeScript |

---

## API

Tutte le rotte girano su runtime Node, senza cache, con timeout di 12 secondi
verso il gateway.

### `POST /api/send`

```jsonc
// richiesta
{ "phone": "+393331234567", "message": "Ciao!", "test": true }

// risposta (successo)
{ "ok": true, "textId": "12345", "quotaRemaining": 1, "test": true,
  "freeTier": true, "segments": 1, "encoding": "GSM-7" }

// risposta (errore)
{ "ok": false, "code": "QUOTA", "message": "Quota gratuita esaurita: ..." }
```

Codici di errore: `BAD_REQUEST`, `INVALID_PHONE`, `EMPTY_MESSAGE`,
`MESSAGE_TOO_LONG`, `RATE_LIMITED`, `QUOTA`, `PROVIDER`, `NETWORK`, `TIMEOUT`.

Limiti per IP chiamante: 4 invii reali e 20 simulazioni ogni 10 minuti
(in memoria, best effort: la difesa vera è la quota del gateway).

### `GET /api/quota`

Crediti residui della chiave in uso: `{ "quotaRemaining": 1, "freeTier": true, "available": true }`.

### `GET /api/status/:textId`

Stato di consegna: `DELIVERED`, `SENT`, `SENDING`, `FAILED`, `UNKNOWN`.
Il client lo interroga automaticamente dopo un invio reale, con backoff crescente.

---

## Struttura

```
src/
├── app/
│   ├── api/send/route.ts        # invio (validazione + rate limit + gateway)
│   ├── api/quota/route.ts       # crediti residui
│   ├── api/status/[id]/route.ts # stato di consegna
│   ├── globals.css              # design system liquid glass
│   ├── layout.tsx               # metadata + sfondo
│   └── page.tsx                 # homepage
├── components/
│   ├── Aurora.tsx               # sfondo animato (server component)
│   ├── CountrySelect.tsx        # combobox prefissi, accessibile
│   ├── Icons.tsx                # icone SVG inline
│   ├── SmsComposer.tsx          # form di invio
│   └── useSpecular.ts           # riflesso che segue il puntatore
└── lib/
    ├── countries.ts             # 190+ prefissi con ricerca
    ├── phone.ts                 # normalizzazione E.164
    ├── rate-limit.ts            # limitatore in memoria
    ├── sms.ts                   # segmenti GSM-7 / UCS-2
    └── textbelt.ts              # client del gateway
```

---

## Il design "liquid glass"

Tre livelli sovrapposti, tutti in CSS puro (nessuna libreria di animazione):

1. **Sfondo vivo** — tre aurore sfocate che derivano lentamente, più una grana
   finissima. È ciò che il vetro rifrange: senza movimento sotto, il vetro sopra
   sembra solo un rettangolo grigio.
2. **Superficie** — `backdrop-filter: blur + saturate`, gradiente diagonale e
   ombre interne che simulano lo spessore del materiale.
3. **Luce** — bordo a gradiente (tecnica `mask-composite`) e riflesso speculare
   che segue il puntatore tramite due variabili CSS aggiornate in un solo frame.

Accessibilità e robustezza: contrasti verificati, navigazione da tastiera completa
nel selettore paesi, `aria-live` sugli esiti, rispetto di `prefers-reduced-motion`
e fallback opaco quando `backdrop-filter` non è supportato.

---

## Deploy

Il progetto è una normale applicazione Next.js: funziona su Vercel, Netlify,
Cloudflare o qualsiasi host Node.

Su **Vercel** (piano Hobby gratuito) basta collegare il repository — il framework
viene rilevato automaticamente. L'unica variabile d'ambiente opzionale è
`TEXTBELT_KEY`.

> Nota: se il progetto Vercel ha la *Deployment Protection* attiva, le API
> rispondono `401` anche al sito stesso. Va disattivata dalle impostazioni del
> progetto (Settings → Deployment Protection) perché l'invio funzioni.

La workflow `.github/workflows/ci.yml` esegue lint, controllo dei tipi e build a
ogni push, senza bisogno di alcun segreto.

---

## Licenza

MIT
