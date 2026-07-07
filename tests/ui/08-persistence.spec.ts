// @vitest-environment jsdom

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EngineInput, EngineOutput } from "@engine";
import { VacationPlanner } from "../../app/_components/vacation-planner";
import { CONFIG_STORAGE_KEY } from "../../app/_lib/user-config-url";

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

function installLocalStorage(initialEntries: Record<string, string> = {}) {
  const entries = new Map(Object.entries(initialEntries));

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

function installClipboard() {
  const writeText = vi.fn<Navigator["clipboard"]["writeText"]>().mockResolvedValue(undefined);

  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });

  return writeText;
}

function installAnimationFrame() {
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    callback(0);
    return 1;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
}

async function submitPlanner(values: {
  budget: string;
  dayOffDate?: string;
  mandatoryLeave?: boolean;
  patronSaintDate?: string;
}) {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText("Giorni di ferie disponibili"), values.budget);
  if (values.dayOffDate) {
    await user.type(screen.getByLabelText("Data 1"), values.dayOffDate);
  }
  if (values.mandatoryLeave) {
    await user.click(screen.getByLabelText("Giorno obbligatorio — scala dal budget"));
  }
  if (values.patronSaintDate) {
    await user.type(
      screen.getByLabelText("Festività del tuo patrono locale (opzionale)"),
      values.patronSaintDate
    );
  }

  await user.click(screen.getByRole("button", { name: "Calcola" }));
  await waitFor(() => expect(calculatePlanSpy).toHaveBeenCalled());

  return user;
}

describe("persistence: localStorage and URL sharing", () => {
  beforeEach(() => {
    calculatePlanSpy.mockClear();
    installLocalStorage();
    installClipboard();
    installAnimationFrame();
    window.history.replaceState(null, "", "/");
  });

  it("saves the submitted config to localStorage after Calcola", async () => {
    render(React.createElement(VacationPlanner));

    await submitPlanner({
      budget: "20",
      dayOffDate: "2026-08-14",
      mandatoryLeave: true,
      patronSaintDate: "2026-06-24",
    });

    expect(JSON.parse(window.localStorage.getItem(CONFIG_STORAGE_KEY) ?? "{}")).toEqual({
      totalVacationDays: 20,
      daysOff: [{ date: "2026-08-14", type: "mandatoryLeave" }],
      patronSaintDate: "2026-06-24",
    });
  });

  it("restores the form from a saved config on reload", async () => {
    installLocalStorage({
      [CONFIG_STORAGE_KEY]: JSON.stringify({
        totalVacationDays: 12,
        daysOff: [{ date: "2026-12-24", type: "companyClosure" }],
        patronSaintDate: "2026-06-24",
      }),
    });

    render(React.createElement(VacationPlanner));

    await waitFor(() => {
      expect(screen.getByLabelText("Giorni di ferie disponibili")).toHaveValue(12);
    });
    expect(screen.getByLabelText("Data 1")).toHaveValue("2026-12-24");
    expect(screen.getByLabelText("Chiusura aziendale — giorno gratuito")).toBeChecked();
    expect(screen.getByLabelText("Festività del tuo patrono locale (opzionale)")).toHaveValue(
      "2026-06-24"
    );
  });

  it("ignores corrupt or missing localStorage values without pre-filling the form", async () => {
    installLocalStorage({ [CONFIG_STORAGE_KEY]: "{" });

    render(React.createElement(VacationPlanner));

    await waitFor(() => {
      expect(screen.getByLabelText("Giorni di ferie disponibili")).toHaveValue(null);
    });
    expect(screen.getByLabelText("Data 1")).toHaveValue("");
    expect(screen.getByRole("button", { name: "Calcola" })).toBeDisabled();
  });

  it("shows Copia link after calculation and copies a valid share URL", async () => {
    render(React.createElement(VacationPlanner));

    const user = await submitPlanner({
      budget: "20",
      dayOffDate: "2026-08-14",
      mandatoryLeave: true,
      patronSaintDate: "2026-06-24",
    });
    const writeText = installClipboard();

    await user.click(screen.getByRole("button", { name: "Copia link" }));

    expect(writeText).toHaveBeenCalledOnce();
    const copiedUrl = new URL(writeText.mock.calls[0][0]);
    expect(copiedUrl.origin).toBe(window.location.origin);
    expect(copiedUrl.searchParams.get("budget")).toBe("20");
    expect(copiedUrl.searchParams.get("daysOff")).toBe("2026-08-14:mandatory");
    expect(copiedUrl.searchParams.get("patron")).toBe("2026-06-24");
  });

  it("pre-fills the form when opening a copied URL in a clean browser", async () => {
    window.history.replaceState(
      null,
      "",
      "/?budget=18&daysOff=2026-08-14:closure,2026-12-24:mandatory&patron=2026-06-24"
    );

    render(React.createElement(VacationPlanner));

    await waitFor(() => {
      expect(screen.getByLabelText("Giorni di ferie disponibili")).toHaveValue(18);
    });
    expect(screen.getByLabelText("Data 1")).toHaveValue("2026-08-14");
    expect(screen.getByLabelText("Data 2")).toHaveValue("2026-12-24");
    expect(screen.getAllByLabelText("Giorno obbligatorio — scala dal budget")[1]).toBeChecked();
    expect(screen.getByLabelText("Festività del tuo patrono locale (opzionale)")).toHaveValue(
      "2026-06-24"
    );
  });

  it("uses valid URL params before localStorage when both are present", async () => {
    installLocalStorage({
      [CONFIG_STORAGE_KEY]: JSON.stringify({
        totalVacationDays: 5,
        daysOff: [{ date: "2026-12-24", type: "mandatoryLeave" }],
      }),
    });
    window.history.replaceState(null, "", "/?budget=22");

    render(React.createElement(VacationPlanner));

    await waitFor(() => {
      expect(screen.getByLabelText("Giorni di ferie disponibili")).toHaveValue(22);
    });
    expect(screen.getByLabelText("Data 1")).toHaveValue("");
    expect(screen.getByLabelText("Chiusura aziendale — giorno gratuito")).toBeChecked();
  });
});
