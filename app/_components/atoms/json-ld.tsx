const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://calcolaferie.it";

export function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${BASE_URL}/#webapp`,
    "name": "CalcolaFerie",
    "url": BASE_URL,
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "All",
    "inLanguage": ["it", "en"],
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
    },
    "description":
      "Calcolatore ponti ferie: trova i migliori ponti tra le festività italiane e ottimizza le vacanze.",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function Ponti2027JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${BASE_URL}/ponti-2027#article`,
    "headline": "Ponti 2027: tutte le date per pianificare le ferie",
    "description":
      "I ponti italiani con la leva più alta di tutto il 2027, calcolati festività per festività.",
    "author": { "@type": "Organization", "name": "CalcolaFerie" },
    "publisher": { "@type": "Organization", "name": "CalcolaFerie" },
    "mainEntityOfPage": `${BASE_URL}/ponti-2027`,
    "inLanguage": ["it", "en"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FaqJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${BASE_URL}/faq#faq`,
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Come funziona il calcolo dei ponti e delle ferie?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Il calcolatore analizza il calendario ufficiale delle festività nazionali italiane, i fine settimana e le eventuali chiusure aziendali. Calcola la 'leva' (rapporto tra giorni totali di stacco continuativo e giorni di ferie effettivi da consumare) per trovare le combinazioni più vantaggiose.",
        },
      },
      {
        "@type": "Question",
        "name": "Quali festività italiane sono incluse?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Include tutte le festività nazionali ufficiali (Capodanno, Epifania, Pasqua, Pasquetta, 25 Aprile, 1 Maggio, 2 Giugno, Ferragosto, 1 Novembre, 8 Dicembre, Natale, Santo Stefano) con possibilità di aggiungere la festa del patrono locale.",
        },
      },
      {
        "@type": "Question",
        "name": "Come vengono considerate le chiusure aziendali?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "È possibile indicare se una data di chiusura è un 'giorno gratuito' (azienda chiusa senza scalare ferie) o un 'giorno obbligatorio' (scalato dal proprio monte ferie), adattando il calcolo alla situazione specifica del tuo contratto.",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
