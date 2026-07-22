// @vitest-environment jsdom

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EngineInput, EngineOutput } from "@engine";
import { VacationPlanner } from "../../app/_components/templates/vacation-planner";

const calculatePlanSpy = vi.hoisted(() =>
  vi.fn(
    (input: EngineInput): EngineOutput => ({
      opportunities: [],
      dayMap: new Map(),
      availableBudget: input.totalVacationDays,
    })
  )
);

vi.mock("@engine", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@engine")>();

  return {
    ...actual,
    calculatePlan: calculatePlanSpy,
  };
});

function setMobileViewport() {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: 390,
  });
  window.dispatchEvent(new Event("resize"));
}

function installLocalStorage() {
  const entries = new Map<string, string>();

  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      clear: () => entries.clear(),
      getItem: (key: string) => entries.get(key) ?? null,
      removeItem: (key: string) => entries.delete(key),
      setItem: (key: string, value: string) => entries.set(key, value),
    },
  });
}

describe("input form UI", () => {
  beforeEach(() => {
    calculatePlanSpy.mockClear();
    installLocalStorage();
    window.localStorage.clear();
    window.history.replaceState(null, "", "/");
    setMobileViewport();
  });

  it("shows only the required vacation budget before opening advanced search", async () => {
    const user = userEvent.setup();
    render(React.createElement(VacationPlanner));

    const budgetInput = screen.getByLabelText("Giorni di ferie disponibili");
    const yearSelect = screen.getByLabelText("Anno");
    const advancedSearch = screen.getByText("Ricerca avanzata").closest("details");

    expect(budgetInput).toBeRequired();
    expect(yearSelect).toHaveValue(String(new Date().getFullYear()));
    expect(advancedSearch).not.toHaveAttribute("open");
    expect(screen.getByRole("button", { name: "Calcola" })).toBeDisabled();

    await user.click(screen.getByText("Ricerca avanzata"));
    expect(advancedSearch).toHaveAttribute("open");
  });

  it("renders accessible mobile inputs and keeps Calcola disabled until the budget is filled", async () => {
    const user = userEvent.setup();
    render(React.createElement(VacationPlanner));

    const budgetInput = screen.getByLabelText("Giorni di ferie disponibili");
    await user.click(screen.getByText("Ricerca avanzata"));
    const dayOffDateInput = screen.getByLabelText("Data 1");
    const patronInput = screen.getByLabelText("Festività del tuo patrono locale (opzionale)");
    const calculateButton = screen.getByRole("button", { name: "Calcola" });

    expect(calculateButton).toBeDisabled();
    expect(dayOffDateInput).toHaveAttribute("type", "date");
    expect(patronInput).toHaveAttribute("type", "date");
    expect(screen.getByLabelText("Chiusura aziendale — giorno gratuito")).toBeChecked();
    expect(screen.getByLabelText("Giorno obbligatorio — scala dal budget")).toBeInTheDocument();

    await user.tab();
    expect(budgetInput).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText("Anno")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Rimuovi" })).toHaveFocus();
    await user.tab();
    expect(dayOffDateInput).toHaveFocus();

    await user.type(budgetInput, "20");
    expect(budgetInput).toHaveValue(20);
    expect(calculateButton).toBeEnabled();
  });

  it("toggles each day-off row between company closure and mandatory leave", async () => {
    const user = userEvent.setup();
    render(React.createElement(VacationPlanner));

    const companyClosure = screen.getByLabelText("Chiusura aziendale — giorno gratuito");
    const mandatoryLeave = screen.getByLabelText("Giorno obbligatorio — scala dal budget");

    expect(companyClosure).toBeChecked();
    expect(mandatoryLeave).not.toBeChecked();

    await user.click(mandatoryLeave);

    expect(companyClosure).not.toBeChecked();
    expect(mandatoryLeave).toBeChecked();
  });

  it("submits form values as EngineInput and includes the patron saint holiday", async () => {
    const user = userEvent.setup();
    const patronDate = new Date();
    patronDate.setDate(patronDate.getDate() + 30);
    const patronDateIso = [
      patronDate.getFullYear(),
      String(patronDate.getMonth() + 1).padStart(2, "0"),
      String(patronDate.getDate()).padStart(2, "0"),
    ].join("-");
    render(React.createElement(VacationPlanner));

    await user.type(screen.getByLabelText("Giorni di ferie disponibili"), "20");
    await user.type(screen.getByLabelText("Data 1"), "2026-08-14");
    await user.click(screen.getByLabelText("Giorno obbligatorio — scala dal budget"));
    await user.type(
      screen.getByLabelText("Festività del tuo patrono locale (opzionale)"),
      patronDateIso
    );
    await user.click(screen.getByRole("button", { name: "Calcola" }));

    await waitFor(() => expect(calculatePlanSpy).toHaveBeenCalledOnce());

    const input = calculatePlanSpy.mock.calls[0][0];
    expect(input.totalVacationDays).toBe(20);
    expect(input.daysOff).toEqual([{ date: "2026-08-14", type: "mandatoryLeave" }]);
    expect(input.publicHolidays).toContainEqual({
      date: patronDateIso,
      key: "patron",
      kind: "patron",
    });
  });

  it("calculates a future year from its first day", async () => {
    const user = userEvent.setup();
    const nextYear = new Date().getFullYear() + 1;
    render(React.createElement(VacationPlanner));

    await user.type(screen.getByLabelText("Giorni di ferie disponibili"), "20");
    await user.selectOptions(screen.getByLabelText("Anno"), String(nextYear));
    await user.click(screen.getByRole("button", { name: "Calcola" }));

    await waitFor(() => expect(calculatePlanSpy).toHaveBeenCalledOnce());
    expect(calculatePlanSpy.mock.calls[0][0].windowStart).toBe(`${nextYear}-01-01`);
  });
});
