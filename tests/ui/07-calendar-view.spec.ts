// @vitest-environment jsdom

import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addDays,
  type DayType,
  type EngineInput,
  type EngineOutput,
  type ISODateString,
} from "@engine";
import { VacationPlanner } from "../../app/_components/vacation-planner";

const calculatePlanSpy = vi.hoisted(() =>
  vi.fn((input: EngineInput): EngineOutput => {
    const dayMap = new Map<ISODateString, DayType>();

    for (let iso = input.windowStart; iso <= input.windowEnd; iso = addDays(iso, 1)) {
      dayMap.set(iso, "workday");
    }

    dayMap.set("2026-07-11", "weekend");
    dayMap.set("2026-08-14", "recommendedLeave");
    dayMap.set("2026-08-15", "publicHoliday");
    dayMap.set("2026-08-16", "weekend");
    dayMap.set("2026-12-24", "companyClosure");
    dayMap.set("2026-12-31", "mandatoryLeave");

    return {
      opportunities: [
        {
          id: "bridge-ferragosto",
          startDate: "2026-08-14",
          endDate: "2026-08-16",
          staccoDays: 3,
          costDays: 1,
          leva: 3,
          recommendedDays: ["2026-08-14"],
          explanation: {
            anchorKind: "publicHoliday",
            anchorHolidayKey: "assumption",
            anchorWeekday: 6,
            costDays: 1,
            staccoDays: 3,
          },
        },
      ],
      availableBudget: input.totalVacationDays,
      dayMap,
    };
  })
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

async function renderCalculatedPlanner() {
  const user = userEvent.setup();
  render(React.createElement(VacationPlanner));

  await user.type(screen.getByLabelText("Giorni di ferie disponibili"), "10");
  await user.click(screen.getByRole("button", { name: "Calcola" }));
  await waitFor(() => expect(calculatePlanSpy).toHaveBeenCalledOnce());

  return { user };
}

describe("calendar view UI", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-07-08T12:00:00"));
    calculatePlanSpy.mockClear();
    installLocalStorage();
    window.localStorage.clear();
    window.history.replaceState(null, "", "/");
    setMobileViewport();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows a graceful empty state and keeps the legend visible before calculation", () => {
    render(React.createElement(VacationPlanner));

    const calendarSection = screen.getByRole("region", { name: "Vista annuale" });
    expect(within(calendarSection).getByLabelText("Legenda calendario")).toBeInTheDocument();
    expect(within(calendarSection).getByText("Calendario pronto dopo il calcolo")).toBeInTheDocument();
  });

  it("renders the rolling calendar from today through the engine window end", async () => {
    await renderCalculatedPlanner();

    const calendarSection = screen.getByRole("region", { name: "Vista annuale" });
    expect(within(calendarSection).getByRole("heading", { name: "luglio 2026" })).toBeInTheDocument();
    expect(within(calendarSection).getByRole("heading", { name: "luglio 2027" })).toBeInTheDocument();

    expect(
      within(calendarSection).getByRole("button", { name: "8 luglio 2026 — Lavorativo" })
    ).toBeInTheDocument();
    expect(
      within(calendarSection).getByRole("button", { name: "8 luglio 2027 — Lavorativo" })
    ).toBeInTheDocument();
    expect(
      within(calendarSection).queryByRole("button", { name: /9 luglio 2027/ })
    ).not.toBeInTheDocument();
  });

  it("uses one day-type class per engine day type and marks recommended leave in green tier", async () => {
    await renderCalculatedPlanner();

    const calendarSection = screen.getByRole("region", { name: "Vista annuale" });
    expect(
      within(calendarSection).getByRole("button", {
        name: /14 agosto 2026 — Ferie consigliate/,
      }).className
    ).toContain("dayCell_recommendedLeave");
    expect(
      within(calendarSection).getByRole("button", { name: /15 agosto 2026 — Festivo — Ferragosto/ })
        .className
    ).toContain("dayCell_publicHoliday");
    expect(
      within(calendarSection).getByRole("button", { name: /24 dicembre 2026 — Chiusura/ })
        .className
    ).toContain("dayCell_companyClosure");
    expect(
      within(calendarSection).getByRole("button", { name: /31 dicembre 2026 — Ferie obbligatorie/ })
        .className
    ).toContain("dayCell_mandatoryLeave");
    expect(
      within(calendarSection).getByRole("button", { name: /11 luglio 2026 — Weekend/ }).className
    ).toContain("dayCell_weekend");
  });

  it("exposes tooltip labels and allows tapping selectable vacation days only", async () => {
    const { user } = await renderCalculatedPlanner();

    const calendarSection = screen.getByRole("region", { name: "Vista annuale" });
    const holiday = within(calendarSection).getByRole("button", {
      name: /15 agosto 2026 — Festivo — Ferragosto/,
    });
    const recommendedLeave = within(calendarSection).getByRole("button", {
      name: /14 agosto 2026 — Ferie consigliate/,
    });

    expect(holiday).toHaveAttribute("title", "15 agosto 2026 — Festivo — Ferragosto");
    expect(holiday).toHaveAttribute("aria-disabled", "true");

    await user.click(holiday);
    expect(within(calendarSection).getByText("0 giorni di ferie selezionati")).toBeInTheDocument();

    await user.click(recommendedLeave);
    expect(within(calendarSection).getByText("1 giorni di ferie selezionati")).toBeInTheDocument();
    expect(
      within(calendarSection).getByRole("button", {
        name: /14 agosto 2026 — Ferie consigliate — Selezionata per ferie/,
      })
    ).toHaveAttribute("aria-pressed", "true");
  });
});
