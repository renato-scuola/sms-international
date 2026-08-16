import SmsComposer from "@/components/SmsComposer";
import { BoltIcon, GlobeIcon, ShieldIcon } from "@/components/Icons";

const FEATURES = [
  {
    icon: GlobeIcon,
    title: "Copertura mondiale",
    body: "Oltre 190 prefissi internazionali con ricerca istantanea e validazione E.164.",
  },
  {
    icon: BoltIcon,
    title: "Zero attesa",
    body: "Nessuna registrazione, nessun cookie di tracciamento: apri la pagina e invii.",
  },
  {
    icon: ShieldIcon,
    title: "Niente dati salvati",
    body: "Il numero passa dal server al gateway e non viene mai scritto su disco.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center gap-8 px-4 py-12 sm:px-6">
      <header className="rise text-center">
        <span className="chip mx-auto">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 pulse-dot" />
          Servizio gratuito
        </span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          SMS{" "}
          <span className="bg-gradient-to-r from-violet-300 via-white to-cyan-200 bg-clip-text text-transparent">
            Internazionale
          </span>
        </h1>
        <p className="mx-auto mt-3 max-w-md text-balance text-sm leading-relaxed text-white/55 sm:text-base">
          Scrivi un messaggio e raggiungi qualsiasi numero al mondo, direttamente
          dal browser.
        </p>
      </header>

      <SmsComposer />

      <section
        className="grid gap-3 sm:grid-cols-3"
        aria-label="Caratteristiche del servizio"
      >
        {FEATURES.map(({ icon: Icon, title, body }, index) => (
          <div
            key={title}
            className="glass rise p-4"
            style={{ animationDelay: `${120 + index * 90}ms` }}
          >
            <Icon className="h-5 w-5 text-white/70" />
            <h3 className="mt-2.5 text-sm font-medium">{title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-white/50">{body}</p>
          </div>
        ))}
      </section>

      <section className="glass rise p-5" style={{ animationDelay: "400ms" }}>
        <h2 className="text-sm font-semibold">Come funziona la quota gratuita</h2>
        <ul className="mt-3 space-y-2 text-xs leading-relaxed text-white/55">
          <li className="flex gap-2">
            <span aria-hidden className="text-white/30">
              —
            </span>
            <span>
              La <strong className="font-medium text-white/80">modalità test</strong>{" "}
              è illimitata e gratuita: verifica tutto il percorso di invio senza
              consumare crediti.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="text-white/30">
              —
            </span>
            <span>
              L’invio reale usa la chiave pubblica di Textbelt, che concede{" "}
              <strong className="font-medium text-white/80">1 SMS al giorno</strong>{" "}
              per indirizzo IP: sul sito online è quindi condivisa tra tutti i
              visitatori.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="text-white/30">
              —
            </span>
            <span>
              Per invii illimitati basta impostare la variabile d’ambiente{" "}
              <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-[11px]">
                TEXTBELT_KEY
              </code>{" "}
              con una chiave personale: il resto dell’applicazione non cambia.
            </span>
          </li>
        </ul>
      </section>

      <footer className="pb-2 text-center text-xs text-white/30">
        Costruito con Next.js e Textbelt · nessun tracciamento, nessun account
      </footer>
    </main>
  );
}
