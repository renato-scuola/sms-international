import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SMS International - Send messages worldwide",
  description: "Free service to send international SMS with modern liquid glass interface",
  keywords: "SMS, messages, international, free, sending",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-black">
      <body className="antialiased bg-black min-h-screen">
        <div className="bg-black min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
