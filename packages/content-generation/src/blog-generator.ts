import { getRAGEngine, type RAGEngine } from "../../engine-rag/src/rag-engine.js";
import type { RAGSearchResult } from "../../engine-rag/src/types.js";
import { ARTICLE_TYPES, type ArticleType } from "./article-types.js";
import { searchDestinations, type DestinationSearchResult } from "./destination-finder.js";
import { callOpenRouter, type OpenRouterOptions } from "./openrouter-client.js";

export interface BlogGeneratorOptions {
  slug?: string;
  articleType?: ArticleType;
  bridgeDays?: number;
  customTitle?: string;
  customDescription?: string;
  expiresAt?: string;
  ragEngine?: RAGEngine;
  useOpenRouter?: boolean;
  openRouterOptions?: OpenRouterOptions;
}

export interface GeneratedBlogDraft {
  slug: string;
  title: string;
  description: string;
  date: string;
  expiresAt?: string;
  articleType: ArticleType;
  mdxContent: string;
  sourcesUsed: string[];
  recommendedDestinations: DestinationSearchResult[];
  generatedBy: "openrouter" | "rag_template";
}

export function prepareBlogPromptContext(
  topic: string,
  options: Pick<BlogGeneratorOptions, "ragEngine"> = {}
): { promptContext: string; searchResults: RAGSearchResult[] } {
  const engine = options.ragEngine || getRAGEngine();
  const results = engine.search(topic, { topK: 8, minScore: 0.05 });
  return {
    promptContext: buildPrivateEditorialNotes(results),
    searchResults: results,
  };
}

export async function generateBlogMDXDraft(
  topic: string,
  options: BlogGeneratorOptions = {}
): Promise<GeneratedBlogDraft> {
  const engine = options.ragEngine || getRAGEngine();
  const articleType: ArticleType = options.articleType || "annual_guide";
  const articleTypeDef = ARTICLE_TYPES[articleType];
  const { promptContext, searchResults } = prepareBlogPromptContext(topic, {
    ragEngine: engine,
  });
  const bridgeDays = options.bridgeDays || 4;
  const topDestinations = searchDestinations({
    bridgeDays,
    holidayName: topic,
    query: topic,
    limit: 4,
    ragEngine: engine,
  });
  const todayStr = new Date().toISOString().split("T")[0];
  const slug = options.slug || slugify(topic);
  const title =
    options.customTitle ||
    `${articleTypeDef.label}: ${topic.charAt(0).toUpperCase() + topic.slice(1)}`;
  const description =
    options.customDescription ||
    `Guida completa per ${topic}: date, combinazioni di ponte a leva alta, destinazioni consigliate con budget e strategie di prenotazione.`;
  const sourcesUsed = Array.from(
    new Set(searchResults.map((result) => result.chunk.relativePath))
  );
  const destinationRows = formatDestinationRows(topDestinations);
  const mdxFromOpenRouter = await maybeGenerateWithOpenRouter({
    topic,
    title,
    description,
    date: todayStr,
    expiresAt: options.expiresAt,
    articleType,
    articleTypeInstructions: articleTypeDef.systemPromptInstructions,
    articleTypeLabel: articleTypeDef.label,
    destinationRows,
    promptContext,
    options,
  });

  return {
    slug,
    title,
    description,
    date: todayStr,
    expiresAt: options.expiresAt,
    articleType,
    mdxContent:
      mdxFromOpenRouter ??
      buildTemplateDraft({
        topic,
        title,
        description,
        date: todayStr,
        expiresAt: options.expiresAt,
        articleTypeLabel: articleTypeDef.label,
        bridgeDays,
        destinationRows,
        searchResults,
      }),
    sourcesUsed,
    recommendedDestinations: topDestinations,
    generatedBy: mdxFromOpenRouter ? "openrouter" : "rag_template",
  };
}

function slugify(topic: string): string {
  return topic
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDestinationRows(destinations: DestinationSearchResult[]): string {
  return destinations
    .map(
      (item) =>
        `| **${item.destination.name}** (${item.destination.country}) | ${item.destination.categoryLabel} | ${item.destination.minDays}-${item.destination.maxDays} giorni | **${item.destination.pricing.budgetLabel}**<br/><small>${item.destination.pricing.estimatedTotalPackage}</small> | [Cerca Hotel](${item.bookingQueryUrl}) |`
    )
    .join("\n");
}

async function maybeGenerateWithOpenRouter(input: {
  topic: string;
  title: string;
  description: string;
  date: string;
  expiresAt?: string;
  articleType: ArticleType;
  articleTypeLabel: string;
  articleTypeInstructions: string;
  destinationRows: string;
  promptContext: string;
  options: BlogGeneratorOptions;
}): Promise<string | null> {
  const apiKey =
    input.options.openRouterOptions?.apiKey ||
    process.env.OPENROUTER_API_KEY ||
    process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

  if (input.options.useOpenRouter === false || !apiKey) {
    return null;
  }

  try {
    const systemPrompt = `Sei un esperto copywriter ed editor di viaggi per CalcolaFerie.it.
Scrivi articoli in italiano perfetti per SEO, estremamente chiari, coinvolgenti ed informativi.
Il tuo compito è scrivere un post completo per il blog in formato MDX, con tono da blog personale autorevole.

ISTRUZIONI SPECIFICHE PER LA TIPOLOGIA DI ARTICOLO (${input.articleTypeLabel}):
${input.articleTypeInstructions}

REGOLE DI FORMATTAZIONE OBBLIGATORIE:
1. Inizia SEMPRE con il frontmatter YAML esattamente in questo formato:
---
title: "${input.title}"
description: "${input.description}"
date: "${input.date}"
${formatExpiresAtFrontmatter(input.expiresAt)}---

2. Usa intestazioni Markdown (##, ###).
3. Non citare fonti, siti, database, RAG, appunti interni o frasi come "secondo le fonti": usa le note solo come contesto privato.
4. Inserisci la tabella delle destinazioni esattamente così dove opportuno:
| Destinazione | Tipologia Viaggio | Durata Consigliata | Fascia di Prezzo & Budget | Prenotazione |
| :--- | :--- | :--- | :--- | :--- |
${input.destinationRows}

5. Inserisci una Call to Action (CTA) al calcolatore di CalcolaFerie alla fine dell'articolo:
[Apri il Calcolatore CalcolaFerie](/) e inserisci il tuo budget di giorni per ricevere subito il tuo piano personalizzato.
`;

    const userPrompt = `ARGOMENTO DEL POST: "${input.topic}"

NOTE EDITORIALI PRIVATE DA USARE SOLO COME CONTESTO, SENZA CITARLE:
${input.promptContext}

SCRIVI ORA L'ARTICOLO COMPLETO IN MDX INCLUDENDO FRONTMATTER, CONSIGLI PRATICI, TABELLA DESTINAZIONI E CTA.`;

    return await callOpenRouter(systemPrompt, userPrompt, input.options.openRouterOptions);
  } catch (err) {
    console.warn(
      `[OpenRouter Fallback] ${(err as Error).message}. Uso template RAG locale.`
    );
    return null;
  }
}

function formatExpiresAtFrontmatter(expiresAt?: string): string {
  return expiresAt ? `expiresAt: "${expiresAt}"\n` : "";
}

function buildTemplateDraft(input: {
  topic: string;
  title: string;
  description: string;
  date: string;
  expiresAt?: string;
  articleTypeLabel: string;
  bridgeDays: number;
  destinationRows: string;
  searchResults: RAGSearchResult[];
}): string {
  return `---
title: "${input.title}"
description: "${input.description}"
date: "${input.date}"
${formatExpiresAtFrontmatter(input.expiresAt)}---

Pianificare le ferie in anticipo è il modo più semplice per trasformare pochi giorni di permesso in periodi di riposo molto più lunghi. In questa guida ti racconto come imposterei **${input.topic}** (${input.articleTypeLabel}) con un approccio pratico, da calendario alla mano.

---

## Il Principio del Moltiplicatore di Vacanza (Leva Ferie)

Per ottenere il massimo valore dal tuo monte ferie, ogni ponte viene valutato in base alla **Leva Ferie**:

$$\\text{Leva} = \\frac{\\text{Giorni Totali di Stacco}}{\\text{Giorni di Ferie Consumati}}$$

Più alta è la leva (es. 4.0× o 5.0×), maggiore è la convenienza del ponte.

---

## Dove Andare e Pricing: Le Migliori Destinazioni per Questo Ponte

In base alla durata del ponte (${input.bridgeDays} giorni), alla stagione e al budget stimato, queste sono le mete che prenderei in considerazione:

| Destinazione | Tipologia Viaggio | Durata Consigliata | Fascia di Prezzo & Budget | Prenotazione |
| :--- | :--- | :--- | :--- | :--- |
${input.destinationRows}

---

## Come imposterei questo ponte

Se dovessi pianificarlo per me, partirei da tre scelte pratiche:

1. **Bloccare prima le date ad alta leva:** prima scelgo i giorni che trasformano meno ferie in più giorni liberi, poi costruisco il viaggio intorno a quelle date.
2. **Tenere una notte di margine:** sui ponti molto richiesti conviene evitare rientri all'ultimo minuto, soprattutto se il giorno dopo si torna al lavoro.
3. **Scegliere la meta in base alla durata reale:** tre giorni pieni funzionano bene per una città europea; oltre una settimana ha senso valutare mete più lontane.

---

## Strategia Consigliata per ${input.topic}

1. **Prenotazione Anticipata:** Blocca i voli e le strutture con 3-5 mesi di anticipo per evitare gli aumenti tariffari tipici dei weekend lunghi.
2. **Sfrutta i Santi Patronali:** Se lavori in una grande città (es. Milano per Sant'Ambrogio il 7 dicembre, Roma per San Pietro e Paolo il 29 giugno), combina la festa locale con i ponti nazionali.
3. **Pianificazione su Misura:** Utilizza il nostro calcolatore per inserire il tuo budget ferie esatto e generare l'itinerario ottimale.

---

## Calcola il tuo Piano Ferie Personalizzato

Vuoi verificare esattamente quante ferie ti restano e quali ponti puoi permetterti? [Apri il Calcolatore CalcolaFerie](/) e inserisci il tuo budget di giorni per ricevere subito il tuo piano personalizzato in tempo reale.
`;
}

function buildPrivateEditorialNotes(results: RAGSearchResult[]): string {
  const notes = results
    .map((result) => sanitizeInternalNote(result.snippet))
    .filter((note) => note.length > 0)
    .slice(0, 6);

  if (notes.length === 0) {
    return "Nessuna nota interna rilevante disponibile.";
  }

  return notes.map((note, index) => `Nota ${index + 1}: ${note}`).join("\n\n");
}

function sanitizeInternalNote(snippet: string): string {
  return snippet
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !/fonte|source|https?:\/\//i.test(line))
    .map((line) => line.replace(/^#{1,6}\s+/, ""))
    .join(" ")
    .replace(/\[[^\]]+\]\([^)]+\)/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 700);
}
