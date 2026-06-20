import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CalcolaFerie",
  description: "Ottimizza le tue ferie",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
