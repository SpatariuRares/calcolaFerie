// @vitest-environment jsdom

import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { BridgeOpportunity, EngineOutput } from "@engine";
import { ResultsTable } from "../../app/_components/organisms/results-table";

function opportunity(overrides: Partial<BridgeOpportunity>): BridgeOpportunity {
  return {
    id: "bridge-1",
    startDate: "2026-08-14",
    endDate: "2026-08-17",
    staccoDays: 4,
    costDays: 1,
    leva: 4,
    recommendedDays: ["2026-08-14"],
    explanation: {
      anchorKind: "publicHoliday",
      anchorHolidayKey: "assumption",
      anchorWeekday: 6,
      costDays: 1,
      staccoDays: 4,
    },
    ...overrides,
  };
}

function output(opportunities: BridgeOpportunity[], availableBudget = 2): EngineOutput {
  return {
    opportunities,
    availableBudget,
    dayMap: new Map(),
  };
}

function renderResults(outputValue: EngineOutput) {
  return render(
    React.createElement(ResultsTable, {
      output: outputValue,
      selectedOpportunityIds: new Set<string>(),
      onToggleOpportunity: vi.fn(),
    })
  );
}

describe("results table UI", () => {
  it("renders opportunities in the engine-provided chronological order", () => {
    const { container } = renderResults(
      output([
        opportunity({
          id: "spring",
          startDate: "2026-04-30",
          endDate: "2026-05-03",
          leva: 2.5,
        }),
        opportunity({
          id: "summer",
          startDate: "2026-08-14",
          endDate: "2026-08-17",
        }),
      ])
    );

    const rows = [...container.querySelectorAll<HTMLElement>("tbody tr")];

    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText("30 apr–3 mag")).toBeInTheDocument();
    expect(within(rows[1]).getByText("14–17 ago")).toBeInTheDocument();
  });

  it("shows the over-budget marker only when cost exceeds the available budget", () => {
    renderResults(
      output(
        [
          opportunity({ id: "within-budget", costDays: 2 }),
          opportunity({ id: "over-budget", costDays: 3, startDate: "2026-12-24" }),
        ],
        2
      )
    );

    expect(screen.getAllByText("Fuori budget")).toHaveLength(2);
  });

  it("assembles single-holiday, fused, and zero-cost Italian explanations", () => {
    renderResults(
      output([
        opportunity({
          id: "single",
          explanation: {
            anchorKind: "publicHoliday",
            anchorHolidayKey: "assumption",
            anchorWeekday: 6,
            costDays: 1,
            staccoDays: 4,
          },
        }),
        opportunity({
          id: "fused",
          startDate: "2026-12-24",
          endDate: "2026-12-27",
          costDays: 2,
          leva: 2,
          explanation: {
            anchorKind: "publicHoliday",
            anchorHolidayKey: "christmas",
            anchorWeekday: 5,
            costDays: 2,
            staccoDays: 4,
            fusedHolidayKeys: ["christmas", "stStephen"],
          },
        }),
        opportunity({
          id: "zero-cost",
          startDate: "2026-11-02",
          endDate: "2026-11-02",
          costDays: 0,
          leva: 0,
          explanation: {
            anchorKind: "companyClosure",
            anchorWeekday: 1,
            costDays: 0,
            staccoDays: 1,
          },
        }),
      ])
    );

    expect(
      screen.getAllByText("Ferragosto cade sabato → 1 giorno di ferie = 4 giorni di stacco")
    ).toHaveLength(2);
    expect(
      screen.getAllByText("Natale + Santo Stefano → 2 giorni di ferie = 4 giorni di stacco")
    ).toHaveLength(2);
    expect(screen.getAllByText("Nessuna feria necessaria — blocco già libero")).toHaveLength(2);
  });

  it("applies the expected leva badge tier classes", () => {
    renderResults(
      output([
        opportunity({ id: "high", leva: 4 }),
        opportunity({ id: "medium", startDate: "2026-04-30", leva: 3.2 }),
        opportunity({ id: "low", startDate: "2026-05-29", leva: 2.4 }),
      ])
    );

    expect(screen.getAllByText("4.0×")[0].className).toContain("levaBadge_high");
    expect(screen.getAllByText("3.2×")[0].className).toContain("levaBadge_medium");
    expect(screen.getAllByText("2.4×")[0].className).toContain("levaBadge_low");
  });

  it("renders both the mobile card list and desktop table markup", () => {
    const { container } = renderResults(output([opportunity({})]));

    expect(container.querySelector("article[role='button']")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("shows an empty state when there are no opportunities", () => {
    renderResults(output([]));

    expect(screen.getByText("Nessun ponte trovato")).toBeInTheDocument();
    expect(
      screen.getByText("Prova ad aumentare il budget o ad aggiungere festività e chiusure nel periodo.")
    ).toBeInTheDocument();
  });

  it("shows disclaimer text with results", () => {
    renderResults(output([opportunity({})]));

    expect(
      screen.getByText(/I risultati sono indicativi/)
    ).toBeInTheDocument();
  });

  it("shows 'Link affiliato' label next to CTA in desktop table view", () => {
    const { container } = renderResults(output([opportunity({})]));
    const tableRow = container.querySelector("tbody tr")!;

    expect(within(tableRow).getByText("Link affiliato")).toBeInTheDocument();
  });

  it("shows 'Link affiliato' label next to CTA in mobile card view", () => {
    const { container } = renderResults(output([opportunity({})]));
    const card = container.querySelector("article[role='button']")!;

    expect(within(card).getByText("Link affiliato")).toBeInTheDocument();
  });

  it("keeps the extended affiliate disclosure and sponsored link relation", () => {
    renderResults(output([opportunity({})]));

    expect(
      screen.getByText(
        "Link affiliato: se prenoti, riceviamo una commissione senza costi extra per te."
      )
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Prenota questi giorni" })[0]).toHaveAttribute(
      "rel",
      expect.stringContaining("sponsored")
    );
  });
});
