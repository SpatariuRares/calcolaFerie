import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://calcolaferie.it";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "CalcolaFerie — Calcolatore Ponti e Ferie Italiane",
  description:
    "Calcolatore ponti ferie: trova i migliori ponti tra le festività italiane e ottimizza le vacanze. Inserisci il budget e scopri i giorni migliori.",
  openGraph: {
    title: "CalcolaFerie — Calcolatore Ponti e Ferie Italiane",
    description:
      "Calcolatore ponti ferie: trova i migliori ponti tra le festività italiane e ottimizza le vacanze.",
    images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630 }],
    url: BASE_URL,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CalcolaFerie — Calcolatore Ponti e Ferie Italiane",
    description:
      "Calcolatore ponti ferie: trova i migliori ponti tra le festività italiane e ottimizza le vacanze.",
    images: [`${BASE_URL}/og-image.png`],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
