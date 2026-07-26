export type ArticleType =
  | "annual_guide"
  | "destination_guide"
  | "patron_saint"
  | "budget_hacks";

export interface ArticleTypeDefinition {
  type: ArticleType;
  label: string;
  description: string;
  systemPromptInstructions: string;
}

export const ARTICLE_TYPES: Record<ArticleType, ArticleTypeDefinition> = {
  annual_guide: {
    type: "annual_guide",
    label: "Guida Calendario Annuale",
    description: "Analisi completa mese per mese delle festività e ponti dell'anno con la leva ferie.",
    systemPromptInstructions: `
Scrivi una GUIDA CALENDARIO ANNUALE dettagliata, professionale ed entusiasmante.
- Struttura l'articolo festività per festività (Capodanno, Epifania, Pasqua, 25 Aprile, 1° Maggio, 2 Giugno, Ferragosto, Ognissanti, 8 Dicembre, Natale).
- Per ciascuna festività specifica: giorno della settimana, ferie da chiedere, giorni consecutivi di stacco e la Leva Ferie (Stacco / Ferie).
- Inserisci la formula della Leva Ferie in LaTeX: $$\\text{Leva} = \\frac{\\text{Stacco}}{\\text{Ferie}}$$.
- Inserisci la tabella delle destinazioni consigliate e la sezione pricing fornita.
- Concludi con la CTA al calcolatore di CalcolaFerie.
`,
  },
  destination_guide: {
    type: "destination_guide",
    label: "Guida Destinazioni & Itinerari",
    description: "Focus sulle mete e sugli itinerari ideali per un ponte specifico.",
    systemPromptInstructions: `
Scrivi una GUIDA DESTINAZIONI & ITINERARI avvincente orientata ai viaggiatori.
- Concentrati sulle migliori mete dove andare durante il ponte specificato.
- Suddividi le mete per tipologia: City Break 3 giorni, Weekend Lunghi 4-5 giorni, e Lungo Raggio per i super-ponti.
- Per ogni destinazione includi consigli pratici, durata ideale e la fascia di prezzo (€/€€/€€€).
- Includi la tabella comparativa delle destinazioni con i link di prenotazione hotel.
- Concludi con la CTA al calcolatore per personalizzare il piano ferie.
`,
  },
  patron_saint: {
    type: "patron_saint",
    label: "Guida Santi Patronali & Ponti Locali",
    description: "Focus sulle festività cittadine (Sant'Ambrogio, San Pietro e Paolo, San Giovanni) per ponti personalizzati.",
    systemPromptInstructions: `
Scrivi una GUIDA AI SANTI PATRONALI E PONTI LOCALI.
- Spiega come il Santo Patrono del proprio comune sia un giorno festivo retribuito extra.
- Analizza le combinazioni migliori (es. Milano con Sant'Ambrogio il 7 dic + Immacolata l'8 dic per fare 5 giorni con 0 ferie, Roma con San Pietro e Paolo il 29 giu, Torino/Firenze/Genova con San Giovanni il 24 giu).
- Spiega come incastrare la festività locale con i ponti nazionali.
- Inserisci la tabella delle destinazioni consigliate con il pricing.
- Concludi invitando il lettore ad inserire la propria città nel calcolatore CalcolaFerie.
`,
  },
  budget_hacks: {
    type: "budget_hacks",
    label: "Guida Strategica & Hacks Ferie",
    description: "Consigli pratici su come risparmiare, prenotare in anticipo e massimizzare la leva ferie.",
    systemPromptInstructions: `
Scrivi una GUIDA HACKS & RISPARMIO FERIE orientata all'ottimizzazione e alla finanza personale da viaggio.
- Spiega la regola dell'anticipo (prenotare 3-5 mesi prima per i weekend lunghi).
- Spiega la tecnica della Workation (smart working adiacente al ponte) per allungare il soggiorno senza consumare ferie.
- Analizza la convenienza delle destinazioni per fascia di prezzo (€ Low Cost vs €€ Moderato vs €€€ Long Haul).
- Inserisci la tabella delle destinazioni con la colonna Pricing & Budget.
- Concludi con la CTA al calcolatore di CalcolaFerie.
`,
  },
};
