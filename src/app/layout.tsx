import type { Metadata, Viewport } from "next";

import Aurora from "@/components/Aurora";
import "./globals.css";

export const metadata: Metadata = {
  title: "SMS Internazionale — invia messaggi in tutto il mondo",
  description:
    "Invia SMS internazionali dal browser: interfaccia liquid glass, validazione E.164, conteggio segmenti e modalità test gratuita illimitata.",
  keywords: ["SMS", "SMS internazionali", "invio SMS", "Textbelt", "gratis"],
  authors: [{ name: "SMS Internazionale" }],
  openGraph: {
    title: "SMS Internazionale",
    description:
      "Invia SMS in tutto il mondo con un'interfaccia liquid glass. Modalità test gratuita e illimitata.",
    type: "website",
    locale: "it_IT",
  },
};

export const viewport: Viewport = {
  themeColor: "#05060b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body className="min-h-dvh antialiased">
        <Aurora />
        {children}
      </body>
    </html>
  );
}
