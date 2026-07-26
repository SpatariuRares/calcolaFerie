const ITALIAN_STOP_WORDS = new Set([
  "a", "agli", "ai", "al", "all", "alla", "alle", "allo", "anche", "che", "chi",
  "ci", "come", "con", "cui", "da", "dal", "dall", "dalla", "dalle", "dallo",
  "dei", "del", "dell", "della", "delle", "dello", "di", "dove", "e", "ed", "è",
  "era", "erano", "essere", "fatto", "fino", "fra", "gli", "ha", "hanno", "ho",
  "i", "il", "in", "invece", "io", "l", "la", "le", "lei", "li", "lo", "loro",
  "ma", "me", "mi", "mia", "mie", "miei", "mio", "ne", "negli", "nei", "nel",
  "nell", "nella", "nelle", "nello", "no", "noi", "non", "nostra", "nostre",
  "nostri", "nostro", "o", "oltre", "per", "perché", "più", "poi", "proprio",
  "qualche", "quale", "quali", "quando", "quest", "questa", "queste", "questi",
  "questo", "qui", "se", "secondo", "sebbene", "senza", "si", "sia", "siamo",
  "siete", "sono", "stata", "state", "stati", "stato", "su", "sua", "sue",
  "sugli", "sui", "sul", "sull", "sulla", "sulle", "sullo", "suoi", "suo",
  "ti", "tra", "tu", "tua", "tue", "tuoi", "tuo", "tutta", "tutte", "tutti",
  "tutto", "un", "una", "uno", "va", "vi", "voi", "vostra", "vostre", "vostri",
  "vostro"
]);

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9\s]/g, " ") // keep alphanumeric
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(text: string): string[] {
  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/).filter(w => w.length > 1);
  return words.filter(word => !ITALIAN_STOP_WORDS.has(word));
}

export function computeTermFrequencies(tokens: string[]): Record<string, number> {
  const tf: Record<string, number> = {};
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }
  return tf;
}

export function cosineSimilarity(
  tf1: Record<string, number>,
  tf2: Record<string, number>
): number {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (const count of Object.values(tf1)) {
    norm1 += count * count;
  }
  for (const count of Object.values(tf2)) {
    norm2 += count * count;
  }

  if (norm1 === 0 || norm2 === 0) return 0;

  for (const [term, count1] of Object.entries(tf1)) {
    if (tf2[term]) {
      dotProduct += count1 * tf2[term];
    }
  }

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}
