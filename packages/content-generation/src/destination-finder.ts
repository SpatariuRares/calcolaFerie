import { getRAGEngine, type RAGEngine } from "../../engine-rag/src/rag-engine.js";
import type { RAGSearchResult } from "../../engine-rag/src/types.js";

export type DestinationCategory =
  | "city_break"
  | "sea"
  | "nature"
  | "snow"
  | "christmas_markets"
  | "long_haul";

export type BudgetTier = "low" | "medium" | "high";

export interface DestinationPricing {
  budgetTier: BudgetTier;
  budgetLabel: string;
  estimatedCostPerDay: string;
  estimatedTotalPackage: string;
}

export interface DestinationItem {
  id: string;
  name: string;
  country: string;
  category: DestinationCategory;
  categoryLabel: string;
  minDays: number;
  maxDays: number;
  bestMonths: number[];
  recommendedHolidays: string[];
  pricing: DestinationPricing;
  description: string;
  travelTips: string;
}

export interface DestinationSearchResult {
  destination: DestinationItem;
  matchScore: number;
  ragSnippets: string[];
  bookingQueryUrl: string;
}

export interface DestinationSearchParams {
  bridgeDays?: number;
  month?: number;
  holidayName?: string;
  category?: DestinationCategory;
  maxBudgetTier?: BudgetTier;
  query?: string;
  limit?: number;
  ragEngine?: RAGEngine;
}

export const DESTINATION_CATALOG: DestinationItem[] = [
  {
    id: "barcellona",
    name: "Barcellona",
    country: "Spagna",
    category: "city_break",
    categoryLabel: "City Break & Cultura",
    minDays: 3,
    maxDays: 4,
    bestMonths: [4, 5, 6, 9, 10],
    recommendedHolidays: ["Pasqua", "1° Maggio", "2 Giugno"],
    pricing: {
      budgetTier: "medium",
      budgetLabel: "€€ Moderato",
      estimatedCostPerDay: "€90 - €130 / giorno",
      estimatedTotalPackage: "€320 - €500 (3-4 giorni volo+hotel)",
    },
    description: "Perfetta per un ponte primaverile tra mare, architettura di Gaudí e tapas.",
    travelTips: "Voli frequenti dalle principali città italiane; ideale per viaggi brevi da 3 giorni.",
  },
  {
    id: "budapest",
    name: "Budapest",
    country: "Ungheria",
    category: "city_break",
    categoryLabel: "City Break & Terme",
    minDays: 3,
    maxDays: 4,
    bestMonths: [3, 4, 5, 10, 11, 12],
    recommendedHolidays: ["Pasqua", "1° Maggio", "8 Dicembre", "Ognissanti"],
    pricing: {
      budgetTier: "low",
      budgetLabel: "€ Low Cost",
      estimatedCostPerDay: "€50 - €80 / giorno",
      estimatedTotalPackage: "€180 - €320 (3-4 giorni volo+hotel)",
    },
    description: "Famosa per i bagni termali Széchenyi, i pub nei ruderi e i mercatini natalizi.",
    travelTips: "Rapporto qualità/prezzo imbattibile per ponti di 3-4 giorni.",
  },
  {
    id: "praga",
    name: "Praga",
    country: "Repubblica Ceca",
    category: "city_break",
    categoryLabel: "City Break Storico",
    minDays: 3,
    maxDays: 4,
    bestMonths: [4, 5, 9, 10, 12],
    recommendedHolidays: ["Pasqua", "25 Aprile", "8 Dicembre"],
    pricing: {
      budgetTier: "low",
      budgetLabel: "€ Low Cost",
      estimatedCostPerDay: "€55 - €85 / giorno",
      estimatedTotalPackage: "€200 - €340 (3-4 giorni volo+hotel)",
    },
    description: "Atmosfera fiabesca, Castello di Praga e il suggestivo Ponte Carlo.",
    travelTips: "Perfetta da esplorare a piedi in 3 giorni interi.",
  },
  {
    id: "parigi",
    name: "Parigi",
    country: "Francia",
    category: "city_break",
    categoryLabel: "City Break & Arte",
    minDays: 3,
    maxDays: 5,
    bestMonths: [4, 5, 6, 9, 10],
    recommendedHolidays: ["Pasqua", "1° Maggio", "2 Giugno"],
    pricing: {
      budgetTier: "medium",
      budgetLabel: "€€ Moderato",
      estimatedCostPerDay: "€110 - €160 / giorno",
      estimatedTotalPackage: "€400 - €650 (3-4 giorni volo/treno+hotel)",
    },
    description: "Passeggiate lungo la Senna, musei iconici e parchi primaverili.",
    travelTips: "Raggiungibile anche in treno TGV dal Nord Italia per evitare i voli.",
  },
  {
    id: "marrakesh",
    name: "Marrakesh e Deserto Agafay",
    country: "Marocco",
    category: "city_break",
    categoryLabel: "Cultura & Avventura",
    minDays: 4,
    maxDays: 5,
    bestMonths: [3, 4, 5, 10, 11],
    recommendedHolidays: ["Pasqua", "25 Aprile", "8 Dicembre"],
    pricing: {
      budgetTier: "low",
      budgetLabel: "€ Low Cost",
      estimatedCostPerDay: "€60 - €95 / giorno",
      estimatedTotalPackage: "€250 - €420 (4 giorni volo+riad)",
    },
    description: "Colori della Medina, spezie, riad di charme e notte sotto le stelle nel deserto.",
    travelTips: "Voli diretti da 3 ore dall'Italia; ideale per un ponte di 4 giorni.",
  },
  {
    id: "istanbul",
    name: "Istanbul e Cappadocia Express",
    country: "Turchia",
    category: "city_break",
    categoryLabel: "Cultura & Fascino",
    minDays: 4,
    maxDays: 5,
    bestMonths: [4, 5, 9, 10, 11],
    recommendedHolidays: ["Pasqua", "25 Aprile", "1° Maggio", "2 Giugno"],
    pricing: {
      budgetTier: "medium",
      budgetLabel: "€€ Moderato",
      estimatedCostPerDay: "€75 - €110 / giorno",
      estimatedTotalPackage: "€320 - €500 (4-5 giorni volo+hotel)",
    },
    description: "Cerniera tra Europa e Asia, bazar mozzafiato e volo in mongolfiera.",
    travelTips: "Ottima per un ponte da 4 o 5 giorni con voli giornalieri.",
  },
  {
    id: "edimburgo",
    name: "Edimburgo & Highlands del Sud",
    country: "Scozia",
    category: "nature",
    categoryLabel: "Natura & Castelli",
    minDays: 4,
    maxDays: 5,
    bestMonths: [5, 6, 7, 8, 9],
    recommendedHolidays: ["25 Aprile", "1° Maggio", "2 Giugno"],
    pricing: {
      budgetTier: "medium",
      budgetLabel: "€€ Moderato",
      estimatedCostPerDay: "€100 - €140 / giorno",
      estimatedTotalPackage: "€420 - €620 (4-5 giorni volo+auto+hotel)",
    },
    description: "Castelli arroccati, vicoli medievali e paesaggi mozzafiato nelle Highlands.",
    travelTips: "Ideale per noleggiare un'auto per 4 giorni di on-the-road.",
  },
  {
    id: "tenerife",
    name: "Tenerife & Canarie",
    country: "Spagna",
    category: "sea",
    categoryLabel: "Mare al Caldo tutto l'anno",
    minDays: 4,
    maxDays: 7,
    bestMonths: [1, 2, 3, 4, 5, 10, 11, 12],
    recommendedHolidays: ["Capodanno", "Epifania", "Pasqua", "8 Dicembre"],
    pricing: {
      budgetTier: "medium",
      budgetLabel: "€€ Moderato",
      estimatedCostPerDay: "€80 - €120 / giorno",
      estimatedTotalPackage: "€350 - €550 (4-5 giorni volo+hotel)",
    },
    description: "Eterna primavera, spiagge vulcaniche, parco del Teide e relax al mare.",
    travelTips: "Voli low cost diretti dall'Italia; meta top per scappare dal freddo invernale.",
  },
  {
    id: "giordania",
    name: "Giordania (Petra, Wadi Rum & Mar Rosso)",
    country: "Giordania",
    category: "long_haul",
    categoryLabel: "Lungo Raggio & Meraviglie",
    minDays: 7,
    maxDays: 10,
    bestMonths: [3, 4, 5, 10, 11],
    recommendedHolidays: ["Primavera Super-Ponte", "Natale & Capodanno"],
    pricing: {
      budgetTier: "high",
      budgetLabel: "€€€ Premium / Long Haul",
      estimatedCostPerDay: "€130 - €190 / giorno",
      estimatedTotalPackage: "€950 - €1500 (8-10 giorni volo+tour)",
    },
    description: "Una delle 7 meraviglie del mondo (Petra), 4x4 nel deserto di Wadi Rum e bagno nel Mar Morto.",
    travelTips: "Perfetta per super-ponti da 8 a 10 giorni.",
  },
  {
    id: "giappone",
    name: "Giappone (Tokyo, Kyoto & Osaka)",
    country: "Giappone",
    category: "long_haul",
    categoryLabel: "Lungo Raggio & Cultura",
    minDays: 8,
    maxDays: 12,
    bestMonths: [3, 4, 10, 11],
    recommendedHolidays: ["Pasqua & 25 Aprile (Fioritura)", "Natale & Capodanno"],
    pricing: {
      budgetTier: "high",
      budgetLabel: "€€€ Premium / Long Haul",
      estimatedCostPerDay: "€150 - €230 / giorno",
      estimatedTotalPackage: "€1400 - €2300 (8-10 giorni volo+jrpass+hotel)",
    },
    description: "Fioritura dei ciliegi (Hanami) in primavera o foliage autunnale tra santuari e grattacieli.",
    travelTips: "Richiede almeno 8-10 giorni continuativi sfruttando i super-ponti di primavera o fine anno.",
  },
  {
    id: "messico",
    name: "Messico (Yucatán & Riviera Maya)",
    country: "Messico",
    category: "sea",
    categoryLabel: "Mare & Rovine Maya",
    minDays: 8,
    maxDays: 12,
    bestMonths: [12, 1, 2, 3, 4],
    recommendedHolidays: ["Natale & Capodanno", "Epifania"],
    pricing: {
      budgetTier: "high",
      budgetLabel: "€€€ Premium / Long Haul",
      estimatedCostPerDay: "€140 - €210 / giorno",
      estimatedTotalPackage: "€1200 - €1900 (8-10 giorni volo+resort)",
    },
    description: "Spiagge caraibiche, cenotes e i templi Maya di Chichén Itzá.",
    travelTips: "Meta ideale per il ponte di Natale e Capodanno per godersi il mare caraibico.",
  },
  {
    id: "toscana-borghi",
    name: "Val d'Orcia & Borghi Toscani",
    country: "Italia",
    category: "nature",
    categoryLabel: "Borghi & Enogastronomia",
    minDays: 3,
    maxDays: 4,
    bestMonths: [4, 5, 6, 9, 10],
    recommendedHolidays: ["Pasqua", "25 Aprile", "1° Maggio", "2 Giugno", "Ognissanti"],
    pricing: {
      budgetTier: "low",
      budgetLabel: "€ Low Cost",
      estimatedCostPerDay: "€65 - €100 / giorno",
      estimatedTotalPackage: "€220 - €380 (3-4 giorni auto+agriturismo)",
    },
    description: "Colline dolci, degustazioni di Brunello di Montalcino e terme naturali all'aperto.",
    travelTips: "Comodamente raggiungibile in auto; zero stress da aeroporto.",
  },
  {
    id: "trentino-mercatini",
    name: "Trentino & Mercatini di Natale",
    country: "Italia",
    category: "christmas_markets",
    categoryLabel: "Mercatini & Neve",
    minDays: 3,
    maxDays: 4,
    bestMonths: [11, 12],
    recommendedHolidays: ["8 Dicembre", "Immacolata", "Sant'Ambrogio"],
    pricing: {
      budgetTier: "low",
      budgetLabel: "€ Low Cost",
      estimatedCostPerDay: "€70 - €110 / giorno",
      estimatedTotalPackage: "€240 - €400 (3-4 giorni hotel+spa)",
    },
    description: "Atmosfera magica tra Trento, Bolzano, Merano e le prime nevicate sulle Dolomiti.",
    travelTips: "Il ponte dell'Immacolata è il momento perfetto per inaugurare i mercatini di Natale.",
  },
];

export function searchDestinations(
  params: DestinationSearchParams = {}
): DestinationSearchResult[] {
  const engine = params.ragEngine || getRAGEngine();
  const limit = params.limit || 5;
  const bridgeDays = params.bridgeDays || 4;
  const month = params.month;
  const holidayName = params.holidayName || "";
  const freeQuery = params.query || "";
  const ragQuery = `${holidayName} ${freeQuery} destinazioni dove andare consigli estate inverno`.trim();
  const ragResults: RAGSearchResult[] = engine.search(ragQuery, { topK: 10 });
  const tiers: BudgetTier[] = ["low", "medium", "high"];

  const scoredResults = DESTINATION_CATALOG
    .filter((dest) => !params.category || dest.category === params.category)
    .filter((dest) => {
      if (!params.maxBudgetTier) {
        return true;
      }
      return tiers.indexOf(dest.pricing.budgetTier) <= tiers.indexOf(params.maxBudgetTier);
    })
    .map((dest): DestinationSearchResult => {
      let score = 1.0;

      if (bridgeDays < dest.minDays) {
        score -= 0.5;
      } else if (bridgeDays <= dest.maxDays) {
        score += 0.4;
      }

      if (month && dest.bestMonths.includes(month)) {
        score += 0.3;
      }

      const normalizedHoliday = holidayName.toLowerCase();
      if (
        normalizedHoliday &&
        dest.recommendedHolidays.some((holiday) => {
          const normalizedRecommended = holiday.toLowerCase();
          return (
            normalizedRecommended.includes(normalizedHoliday) ||
            normalizedHoliday.includes(normalizedRecommended)
          );
        })
      ) {
        score += 0.4;
      }

      const matchingSnippets = ragResults
        .filter((ragRes) => {
          const snippet = ragRes.snippet.toLowerCase();
          return (
            snippet.includes(dest.name.toLowerCase()) ||
            snippet.includes(dest.country.toLowerCase())
          );
        })
        .map((ragRes) => ragRes.snippet.split("\n")[0])
        .slice(0, 2);

      score += matchingSnippets.length * 0.2;

      return {
        destination: dest,
        matchScore: Math.round(score * 10) / 10,
        ragSnippets: matchingSnippets,
        bookingQueryUrl: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(
          `${dest.name} ${dest.country}`
        )}`,
      };
    });

  return scoredResults.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
}
