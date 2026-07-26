import {
  ARTICLE_TYPES,
  generateBlogMDXDraft,
  saveBlogMDXPost,
  type ArticleType,
  type BlogVisibility,
} from "../packages/content-generation/src/index.js";
import {
  getRAGEngine,
} from "../packages/engine-rag/src/index.js";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

type BlogCommandInput = {
  topic: string;
  articleType: ArticleType;
  visibility: BlogVisibility;
  model?: string;
};

type ParsedArgs = {
  positional: string[];
  visibility?: BlogVisibility;
  model?: string;
};

async function run() {
  const { topic, articleType, visibility, model } = await readCommandInput();

  console.log(`🤖 [Blog Generator] Preparazione articolo per: "${topic}"...`);
  console.log(`🏷️ Tipologia articolo: "${articleType}"`);
  console.log(`👁️ Visibilità articolo: "${visibility}"`);

  const engine = getRAGEngine();
  const stats = engine.getStats();

  console.log(`📚 Archivio contenuti pronto: ${stats.totalDocuments} documenti indicizzati (${stats.totalChunks} blocchi totali).`);

  const draft = await generateBlogMDXDraft(topic, {
    articleType,
    ragEngine: engine,
    openRouterOptions: model ? { model } : undefined,
  });

  console.log(`\n✨ Bozza generata con successo! (Modalità: ${draft.generatedBy.toUpperCase()})`);
  console.log(`📌 Titolo: "${draft.title}"`);
  console.log(`📌 Slug: ${draft.slug}`);
  console.log(`🧭 Note interne usate: ${draft.sourcesUsed.length}`);

  const published = saveBlogMDXPost(draft, { ragEngine: engine, visibility });

  console.log(`📌 File di destinazione: ${published.relativePath}`);
  console.log(`\n🚀 Articolo salvato come ${published.visibility} e pronto per il blog.`);
}

async function readCommandInput(): Promise<BlogCommandInput> {
  const parsedArgs = parseRawArgs(process.argv.slice(2));
  if (parsedArgs.positional.length > 0) {
    return parseArgs(parsedArgs);
  }

  const rl = readline.createInterface({ input, output });
  try {
    const topic = await askRequired(rl, "Tema dell'articolo: ");
    const articleType = await askArticleType(rl);
    const visibility = parsedArgs.visibility || (await askVisibility(rl));
    return { topic, articleType, visibility };
  } finally {
    rl.close();
  }
}

function parseRawArgs(rawArgs: string[]): ParsedArgs {
  const positional: string[] = [];
  let visibility: BlogVisibility | undefined;
  let model: string | undefined;

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg === "--") {
      continue;
    }
    if (arg === "--visibility") {
      const value = rawArgs[i + 1];
      if (value === "visible" || value === "hidden") {
        visibility = value;
        i++;
        continue;
      }
      console.error('❌ Valore --visibility non valido. Usa "visible" oppure "hidden".');
      process.exit(1);
    }
    if (arg === "--model") {
      model = rawArgs[i + 1];
      if (!model) {
        console.error("❌ Manca il valore per --model.");
        process.exit(1);
      }
      i++;
      continue;
    }
    positional.push(arg);
  }

  return { positional, visibility, model };
}

function parseArgs(parsedArgs: ParsedArgs): BlogCommandInput {
  const [topic, rawArticleType, rawThird, rawFourth] = parsedArgs.positional;
  const articleType = (rawArticleType || "annual_guide") as ArticleType;
  const inlineVisibility = rawThird === "hidden" || rawThird === "visible" ? rawThird : undefined;
  const visibility: BlogVisibility = parsedArgs.visibility || inlineVisibility || "visible";
  const model = parsedArgs.model || (inlineVisibility ? rawFourth : rawThird);

  if (!(articleType in ARTICLE_TYPES)) {
    console.error(
      `❌ Tipologia articolo non valida: "${articleType}". Valori validi: ${Object.keys(ARTICLE_TYPES).join(", ")}`
    );
    process.exit(1);
  }

  return { topic, articleType, visibility, model };
}

async function askRequired(
  rl: readline.Interface,
  prompt: string
): Promise<string> {
  while (true) {
    const answer = (await rl.question(prompt)).trim();
    if (answer.length > 0) {
      return answer;
    }
    console.log("Inserisci un valore.");
  }
}

async function askArticleType(rl: readline.Interface): Promise<ArticleType> {
  const validTypes = Object.keys(ARTICLE_TYPES) as ArticleType[];
  console.log(`Tipi disponibili: ${validTypes.join(", ")}`);

  while (true) {
    const answer = (await rl.question("Tipo articolo [annual_guide]: ")).trim();
    const articleType = (answer || "annual_guide") as ArticleType;
    if (articleType in ARTICLE_TYPES) {
      return articleType;
    }
    console.log(`Tipo non valido. Usa uno tra: ${validTypes.join(", ")}`);
  }
}

async function askVisibility(rl: readline.Interface): Promise<BlogVisibility> {
  while (true) {
    const answer = (await rl.question("Visibilità [visible/hidden, default visible]: ")).trim();
    if (answer === "") {
      return "visible";
    }
    if (answer === "visible" || answer === "hidden") {
      return answer;
    }
    console.log('Visibilità non valida. Usa "visible" oppure "hidden".');
  }
}

run().catch((err) => {
  console.error("❌ Errore durante la generazione del blog:", err);
  process.exit(1);
});
