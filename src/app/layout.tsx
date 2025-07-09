import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SMS Internazionale - Invia messaggi in tutto il mondo",
  description: "Servizio gratuito per inviare SMS internazionali con interfaccia moderna liquid glass",
  keywords: "SMS, messaggi, internazionale, gratuito, invio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
