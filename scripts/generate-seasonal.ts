import fs from "node:fs";
import path from "node:path";
import { getItalianPublicHolidays } from "@engine";
import {
  bestBridgeFor,
  buildPost,
  holidayLabel,
  isWeekend,
  parseYear,
  slugFor,
} from "./lib/seasonal";
import type { LocalBridge } from "./lib/seasonal";

const OUTPUT_DIR = path.join(process.cwd(), "content", "blog", "visible");

function generate(): void {
  const year = parseYear(process.argv[2]);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const holidays = getItalianPublicHolidays(year);
  let written = 0;
  let skipped = 0;

  for (const holiday of holidays) {
    const label = holidayLabel(holiday.key);

    if (isWeekend(holiday.date)) {
      console.log(`↩ ${label} (${holiday.date}) cade nel weekend, nessun ponte.`);
      skipped++;
      continue;
    }

    let opp: LocalBridge;
    try {
      opp = bestBridgeFor(holiday);
    } catch (err) {
      console.log(`- ${label} (${holiday.date}): ${(err as Error).message}`);
      skipped++;
      continue;
    }

    const fileName = path.join(OUTPUT_DIR, `${slugFor(holiday)}.mdx`);
    if (fs.existsSync(fileName)) {
      console.log(`= ${label}: esiste già, saltato.`);
      skipped++;
      continue;
    }

    const mdx = buildPost(holiday, opp);
    fs.writeFileSync(fileName, mdx, "utf-8");
    console.log(`✓ ${label} ${year} — leva ${opp.leva.toFixed(2)}x, stacco ${opp.staccoDays}g, ferie ${opp.costDays}g`);
    written++;
  }

  console.log(`\nFatto: ${written} post scritti, ${skipped} saltati.`);
}

generate();