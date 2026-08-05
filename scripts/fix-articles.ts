import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  bestBridgeFor,
  buildPost,
  parseGeneratedSlug,
} from "./lib/seasonal";
import type { ISODateString } from "@engine";
import type { LocalBridge } from "./lib/seasonal";

const OUTPUT_DIR = path.join(process.cwd(), "content", "blog", "visible");

const DRY_RUN = process.argv.includes("--dry-run");
// Di default fix:articles interviene SOLO sugli articoli non ancora pubblicati
// (date nel futuro), per non sovrascrivere i testi già "mr. live" ed eventualmente
// riallineati a mano. Passa --all per forzare il riallineamento anche dei già pubblicati.
const ONLY_UNPUBLISHED = !process.argv.includes("--all");

const BLOG_TIME_ZONE = "Europe/Rome";

interface FixResult {
  file: string;
  status: "unknown" | "rewritten" | "ok" | "published" | "error";
  detail?: string;
}

function getTodayIso(): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: BLOG_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function fixArticles(): void {
  if (!fs.existsSync(OUTPUT_DIR)) {
    console.log("Nessuna cartella contenuti, nulla da riparare.");
    return;
  }

  const files = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith(".mdx"));
  const results: FixResult[] = [];

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, "");
    const holiday = parseGeneratedSlug(slug);

    // I post che non seguono il pattern di generate-seasonal (es. scritti a
    // mano) vengono lasciati intatti.
    if (!holiday) {
      results.push({ file, status: "unknown", detail: "non generato da generate-seasonal" });
      continue;
    }

    const filePath = path.join(OUTPUT_DIR, file);
    const current = fs.readFileSync(filePath, "utf-8");

    // Se l'articolo è già stato pubblicato (date <= oggi) e NON è stato
    // chiesto --all, lo lascio intatto.
    const existingDate = readDate(current);
    if (ONLY_UNPUBLISHED && existingDate && existingDate <= getTodayIso()) {
      results.push({ file, status: "published", detail: "già pubblicato, saltato" });
      continue;
    }

    let opp: LocalBridge;
    try {
      opp = bestBridgeFor(holiday);
    } catch (err) {
      results.push({ file, status: "error", detail: (err as Error).message });
      continue;
    }

    // Rigenera il post canonico per questa festa, preservando la data di
    // pubblicazione già scelta (evita che la data salti a "oggi" a ogni run).
    const fresh = buildPost(holiday, opp, existingDate);

    if (current === fresh) {
      results.push({ file, status: "ok" });
      continue;
    }

    if (DRY_RUN) {
      results.push({
        file,
        status: "rewritten",
        detail: "DA RIALLINEARE (dry run, non scritto)",
      });
      continue;
    }

    fs.writeFileSync(filePath, fresh, "utf-8");
    results.push({ file, status: "rewritten", detail: "riallineato al template + dati engine" });
  }

  const unknown = results.filter((r) => r.status === "unknown");
  const ok = results.filter((r) => r.status === "ok");
  const rewritten = results.filter((r) => r.status === "rewritten");
  const published = results.filter((r) => r.status === "published");
  const errors = results.filter((r) => r.status === "error");

  for (const r of results) {
    if (r.status === "ok" || r.status === "published") continue;
    const icon =
      r.status === "rewritten"
        ? "✓"
        : r.status === "unknown"
          ? "·"
          : "✗";
    console.log(`${icon} ${r.file}${r.detail ? ` — ${r.detail}` : ""}`);
  }

  console.log(
    `\nRiepilogo: ${rewritten.length} riallineati, ${ok.length} a posto, ${published.length} già pubblicati (saltati), ${unknown.length} ignorati (a mano), ${errors.length} errori`
  );
  console.log(DRY_RUN ? "(dry run attivo: nessun file è stato modificato)" : "");
}

function readDate(content: string): ISODateString | undefined {
  try {
    const parsed = matter(content);
    const date = parsed.data.date;
    return typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? (date as ISODateString)
      : undefined;
  } catch {
    return undefined;
  }
}

fixArticles();