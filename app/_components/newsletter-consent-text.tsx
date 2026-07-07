import Link from "next/link";

export function NewsletterConsentText() {
  return (
    <>
      Accetto il trattamento del mio indirizzo email per ricevere aggiornamenti su CalcolaFerie e ho
      letto la <Link href="/privacy">privacy policy</Link>.
    </>
  );
}
