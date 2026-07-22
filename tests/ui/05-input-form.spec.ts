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

  it("renders accessible mobile inputs and keeps Calcola disabled until the budget is filled", async () => {
    const user = userEvent.setup();
    render(React.createElement(VacationPlanner));

    const budgetInput = screen.getByLabelText("Giorni di ferie disponibili");
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
    render(React.createElement(VacationPlanner));

    await user.type(screen.getByLabelText("Giorni di ferie disponibili"), "20");
    await user.type(screen.getByLabelText("Data 1"), "2026-08-14");
    await user.click(screen.getByLabelText("Giorno obbligatorio — scala dal budget"));
    await user.type(
      screen.getByLabelText("Festività del tuo patrono locale (opzionale)"),
      "2026-07-20"
    );
    await user.click(screen.getByRole("button", { name: "Calcola" }));

    await waitFor(() => expect(calculatePlanSpy).toHaveBeenCalledOnce());

    const input = calculatePlanSpy.mock.calls[0][0];
    expect(input.totalVacationDays).toBe(20);
    expect(input.daysOff).toEqual([{ date: "2026-08-14", type: "mandatoryLeave" }]);
    expect(input.publicHolidays).toContainEqual({
      date: "2026-07-20",
      key: "patron",
      kind: "patron",
    });
  });
});
