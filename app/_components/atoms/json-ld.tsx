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

export function BlogJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${BASE_URL}/blog#blog`,
    "name": "Blog CalcolaFerie",
    "url": `${BASE_URL}/blog`,
    "inLanguage": ["it", "en"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BlogPostingJsonLd({
  slug,
  title,
  description,
  date,
}: {
  slug: string;
  title: string;
  description: string;
  date: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${BASE_URL}/blog/${slug}#article`,
    "headline": title,
    "description": description,
    "datePublished": date,
    "author": { "@type": "Organization", "name": "CalcolaFerie" },
    "publisher": { "@type": "Organization", "name": "CalcolaFerie" },
    "mainEntityOfPage": `${BASE_URL}/blog/${slug}`,
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

export function HowToJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${BASE_URL}/#howto`,
    "name": "Come calcolare i ponti e ottimizzare le ferie",
    "description":
      "In tre passaggi trova i ponti tra le festività italiane che massimizzano i giorni di stacco per ogni giorno di ferie speso.",
    "inLanguage": "it",
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Inserisci i giorni di ferie disponibili",
        "text": "Indica quanti giorni di ferie hai a disposizione per l'anno da pianificare.",
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Aggiungi patrono e chiusure aziendali",
        "text": "Specifica la festa del patrono locale ed eventuali chiusure aziendali, distinguendo tra giorni gratuiti e ferie obbligatorie.",
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Calcola e scegli i ponti migliori",
        "text": "Premi Calcola per ottenere i ponti ordinati per leva, ossia i giorni di stacco ottenuti per ogni giorno di ferie speso.",
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
