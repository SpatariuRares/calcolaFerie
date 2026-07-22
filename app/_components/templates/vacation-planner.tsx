"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { isoToDate, tryIsoDate, type DayOff, type ISODateString, type UserConfig } from "@engine";
import { calculateVacationPlan, type CalculationState } from "../../_lib/calculate-vacation-plan";
import { buildSelectableVacationDates } from "../../_lib/calendar-model";
import {
  CONFIG_STORAGE_KEY,
  MAX_VACATION_DAYS,
  getInitialUserConfig,
  type PlannerConfig,
  serializeConfig,
  serializeStoredConfig,
} from "../../_lib/user-config-url";
import { useAppTranslations } from "../../_lib/use-app-i18n";
import styles from "../../styles/app.module.scss";
import type { DayOffRow } from "../planner-types";
import { buildSelectedRanges, CalendarView } from "../organisms/calendar-view";
import { NewsletterSignup } from "../organisms/newsletter-signup";
import { PlannerForm } from "../organisms/planner-form";
import { ResultsPanel } from "../organisms/results-panel";
import { SelectedVacationsTable } from "../organisms/selected-vacations-table";
import { SiteFooter } from "../organisms/site-footer";
import { SiteHeader } from "../organisms/site-header";

function createDayOffRow(id: string, type: DayOff["type"] = "companyClosure"): DayOffRow {
  return {
    id,
    date: "",
    type,
  };
}

function createDayOffRows(dayOffs: DayOff[]): DayOffRow[] {
  if (dayOffs.length === 0) return [createDayOffRow("day-off-0")];

  return dayOffs.map((dayOff, index) => ({
    ...dayOff,
    id: `day-off-${index}`,
  }));
}

function parseVacationDays(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > MAX_VACATION_DAYS) return null;
  return parsed;
}

function readStoredConfig(): string | null {
  try {
    return window.localStorage?.getItem(CONFIG_STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

export function VacationPlanner() {
  const t = useAppTranslations("planner");
  const nextDayOffId = useRef(1);
  const currentYear = new Date().getFullYear();
  const [totalVacationDays, setTotalVacationDays] = useState("");
  const [planningYear, setPlanningYear] = useState(currentYear);
  const [dayOffRows, setDayOffRows] = useState<DayOffRow[]>([createDayOffRow("day-off-0")]);
  const [patronSaintDate, setPatronSaintDate] = useState("");
  const [calculation, setCalculation] = useState<CalculationState | null>(null);
  const [submittedConfig, setSubmittedConfig] = useState<PlannerConfig | null>(null);
  const [shareStatus, setShareStatus] = useState("");
  const [selectedVacationDates, setSelectedVacationDates] = useState<Set<string>>(() => new Set());
  const [selectedOpportunityIds, setSelectedOpportunityIds] = useState<Set<string>>(
    () => new Set()
  );

  const parsedVacationDays = parseVacationDays(totalVacationDays);
  const canCalculate = parsedVacationDays !== null;

  useEffect(() => {
    const config = getInitialUserConfig(
      new URLSearchParams(window.location.search),
      readStoredConfig()
    );
    if (!config) return;

    let isCancelled = false;
    const animationFrame = window.requestAnimationFrame(() => {
      if (isCancelled) return;

      const rows = createDayOffRows(config.daysOff);
      nextDayOffId.current = rows.length;
      setTotalVacationDays(String(config.totalVacationDays));
      setDayOffRows(rows);
      setPatronSaintDate(config.patronSaintDate ?? "");
      setSelectedVacationDates(new Set(config.selectedVacationDates ?? []));

      if (config.selectedVacationDates && config.selectedVacationDates.length > 0) {
        setSubmittedConfig(config);
        setCalculation(calculateVacationPlan(config));
      }
    });

    return () => {
      isCancelled = true;
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  function updateDayOffDate(id: string, date: string) {
    setDayOffRows((rows) => rows.map((row) => (row.id === id ? { ...row, date } : row)));
  }

  function updateDayOffType(id: string, type: DayOff["type"]) {
    setDayOffRows((rows) => rows.map((row) => (row.id === id ? { ...row, type } : row)));
  }

  function removeDayOff(id: string) {
    setDayOffRows((rows) =>
      rows.length === 1 ? [{ ...rows[0], date: "" }] : rows.filter((row) => row.id !== id)
    );
  }

  function addDayOff() {
    const id = `day-off-${nextDayOffId.current}`;
    nextDayOffId.current += 1;
    setDayOffRows((rows) => [...rows, createDayOffRow(id)]);
  }

  function toggleVacationDate(isoDate: string) {
    const nextDates = new Set(selectedVacationDates);
    if (nextDates.has(isoDate)) {
      nextDates.delete(isoDate);
    } else {
      nextDates.add(isoDate);
    }

    setSelectedVacationDates(nextDates);
    saveSelectedVacationDates(nextDates);
  }

  function toggleOpportunity(opportunityId: string) {
    const opportunities = calculation?.output.opportunities ?? [];
    const opportunity = opportunities.find((item) => item.id === opportunityId);

    const nextIds = new Set(selectedOpportunityIds);
    const isSelecting = !nextIds.has(opportunityId);
    if (isSelecting) {
      nextIds.add(opportunityId);
    } else {
      nextIds.delete(opportunityId);
    }
    setSelectedOpportunityIds(nextIds);

    if (!opportunity) return;

    const nextDates = new Set(selectedVacationDates);
    if (isSelecting) {
      opportunity.recommendedDays.forEach((date) => nextDates.add(date));
    } else {
      const daysStillNeeded = new Set(
        opportunities
          .filter((item) => item.id !== opportunityId && nextIds.has(item.id))
          .flatMap((item) => item.recommendedDays)
      );
      opportunity.recommendedDays.forEach((date) => {
        if (!daysStillNeeded.has(date)) nextDates.delete(date);
      });
    }

    setSelectedVacationDates(nextDates);
    saveSelectedVacationDates(nextDates);
  }

  function setVacationDateRange(isoDates: string[], shouldSelect: boolean) {
    if (isoDates.length === 0) return;
    const nextDates = new Set(selectedVacationDates);
    isoDates.forEach((date) => {
      if (shouldSelect) {
        nextDates.add(date);
      } else {
        nextDates.delete(date);
      }
    });
    setSelectedVacationDates(nextDates);
    saveSelectedVacationDates(nextDates);
  }

  function buildUserConfig(totalVacationDays: number): UserConfig {
    const daysOff: DayOff[] = dayOffRows.flatMap(({ date, type }) => {
      if (date === "") return [];
      const iso = tryIsoDate(date);
      return iso ? [{ date: iso, type }] : [];
    });
    const parsedPatronSaintDate = patronSaintDate ? tryIsoDate(patronSaintDate) : null;

    return {
      totalVacationDays,
      daysOff,
      ...(parsedPatronSaintDate ? { patronSaintDate: parsedPatronSaintDate } : {}),
    };
  }

  function saveUserConfig(config: PlannerConfig) {
    try {
      window.localStorage.setItem(CONFIG_STORAGE_KEY, serializeStoredConfig(config));
    } catch {
      // Storage can be unavailable in private contexts; calculation should still work.
    }
  }

  function withSelectedVacationDates(config: UserConfig, dates: Set<string>): PlannerConfig {
    const baseConfig: PlannerConfig = { ...config };
    delete baseConfig.selectedVacationDates;
    const selectedVacationDates = [...dates]
      .flatMap((date): ISODateString[] => {
        const iso = tryIsoDate(date);
        return iso ? [iso] : [];
      })
      .sort((a, b) => a.localeCompare(b));

    return {
      ...baseConfig,
      ...(selectedVacationDates.length > 0 ? { selectedVacationDates } : {}),
    };
  }

  function saveSelectedVacationDates(dates: Set<string>) {
    if (!submittedConfig) return;

    const nextConfig = withSelectedVacationDates(submittedConfig, dates);
    setSubmittedConfig(nextConfig);
    saveUserConfig(nextConfig);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (parsedVacationDays === null) return;

    const config = buildUserConfig(parsedVacationDays);

    setSelectedVacationDates(new Set());
    setSelectedOpportunityIds(new Set());
    setShareStatus("");
    setSubmittedConfig(config);
    saveUserConfig(config);
    const yearStart = tryIsoDate(`${planningYear}-01-01`);
    const calculationDate =
      planningYear === currentYear || !yearStart ? new Date() : isoToDate(yearStart);
    setCalculation(calculateVacationPlan(config, calculationDate));
  }

  async function handleCopyLink() {
    if (!submittedConfig) return;

    const params = serializeConfig(submittedConfig);
    const link = `${window.location.origin}?${params.toString()}`;

    try {
      await navigator.clipboard.writeText(link);
      setShareStatus(t("form.linkCopied"));
    } catch {
      setShareStatus(t("form.copyFailed"));
    }
  }

  return (
    <main className={styles.pageShell}>
      <SiteHeader />

      <div className={styles.toolLayout}>
        <div className={styles.formColumn}>
          <PlannerForm
            canCalculate={canCalculate}
            currentYear={currentYear}
            dayOffRows={dayOffRows}
            onAddDayOff={addDayOff}
            onCopyLink={handleCopyLink}
            onDayOffDateChange={updateDayOffDate}
            onDayOffTypeChange={updateDayOffType}
            onPatronSaintDateChange={setPatronSaintDate}
            onPlanningYearChange={setPlanningYear}
            onRemoveDayOff={removeDayOff}
            onSubmit={handleSubmit}
            onTotalVacationDaysChange={setTotalVacationDays}
            patronSaintDate={patronSaintDate}
            planningYear={planningYear}
            shareStatus={shareStatus}
            submittedConfig={submittedConfig}
            totalVacationDays={totalVacationDays}
          />

          <NewsletterSignup isVisible={calculation !== null} />
        </div>

        <div className={styles.outputStack}>
          <ResultsPanel
            calculation={calculation}
            onToggleOpportunity={toggleOpportunity}
            selectedOpportunityIds={selectedOpportunityIds}
          />
          <CalendarView
            calculation={calculation}
            onClearSelectedVacationDates={() => {
              const nextDates = new Set<string>();
              setSelectedVacationDates(nextDates);
              saveSelectedVacationDates(nextDates);
            }}
            onSelectVacationDateRange={setVacationDateRange}
            onToggleVacationDate={toggleVacationDate}
            selectedVacationDates={selectedVacationDates}
          />
          {calculation ? (
            <SelectedVacationsTable
              ranges={buildSelectedRanges(
                buildSelectableVacationDates(calculation.input, calculation.output),
                selectedVacationDates
              )}
            />
          ) : null}
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
