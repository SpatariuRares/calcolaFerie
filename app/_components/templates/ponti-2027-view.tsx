"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { calculatePlan, getPublicHolidaysForWindow, toISO } from "@engine";
import type { CalculationState } from "../../_lib/calculate-vacation-plan";
import { Ponti2027JsonLd } from "../atoms/json-ld";
import { ResultsTable } from "../organisms/results-table";
import styles from "../../styles/app.module.scss";

const WINDOW_START = toISO(2026, 12, 15);
const WINDOW_END = toISO(2028, 1, 15);
const SAMPLE_BUDGET = 20;
const WORK_SCHEDULE = { workDays: new Set<0 | 1 | 2 | 3 | 4 | 5 | 6>([1, 2, 3, 4, 5]), consumeHolidaysOnPublicHolidays: false };

export function Ponti2027View() {
  const t = useTranslations("ponti2027");
  const tPrivacy = useTranslations("privacy");
  const formula = <strong>{t("formula")}</strong>;
  const [selectedOpportunityIds, setSelectedOpportunityIds] = useState<Set<string>>(new Set());

  const calculation: CalculationState = useMemo(() => {
    const publicHolidays = getPublicHolidaysForWindow(WINDOW_START, WINDOW_END);
    const input = {
      windowStart: WINDOW_START,
      windowEnd: WINDOW_END,
      workSchedule: WORK_SCHEDULE,
      publicHolidays,
      daysOff: [],
      totalVacationDays: SAMPLE_BUDGET,
    };
    return { input, output: calculatePlan(input) };
  }, []);

  function toggleOpportunity(opportunityId: string) {
    setSelectedOpportunityIds((current) => {
      const next = new Set(current);
      if (next.has(opportunityId)) {
        next.delete(opportunityId);
      } else {
        next.add(opportunityId);
      }
      return next;
    });
  }

  return (
    <main className={styles.pageShell}>
      <Ponti2027JsonLd />
      <article className={styles.privacyPage} aria-labelledby="ponti2027-title">
        <Link className={styles.backLink} href="/">
          {tPrivacy("back")}
        </Link>
        <header className={styles.privacyHeader}>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <h1 id="ponti2027-title">{t("title")}</h1>
          <p>{t("subtitle")}</p>
        </header>

        <section>
          <p>{t("intro1")}</p>
          <p>{t.rich("intro2", { formula: () => formula })}</p>
          <p>{t("sampleIntro", { budget: SAMPLE_BUDGET })}</p>
        </section>

        <section className={styles.outputSection} aria-labelledby="ponti2027-table-title">
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>{t("eyebrow")}</p>
              <h2 id="ponti2027-table-title">{t("tableTitle")}</h2>
            </div>
          </div>
          <ResultsTable
            onToggleOpportunity={toggleOpportunity}
            output={calculation.output}
            selectedOpportunityIds={selectedOpportunityIds}
          />
        </section>

        <section>
          <h2>{t("ctaTitle")}</h2>
          <p>{t("ctaBody")}</p>
          <p>
            <Link href={`/?budget=${SAMPLE_BUDGET}`}>{t("ctaButton")}</Link>
          </p>
        </section>
      </article>
    </main>
  );
}
