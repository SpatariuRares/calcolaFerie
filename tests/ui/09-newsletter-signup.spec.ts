// @vitest-environment jsdom

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EngineInput, EngineOutput } from "@engine";
import { VacationPlanner } from "../../app/_components/vacation-planner";

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

function installAnimationFrame() {
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    callback(0);
    return 1;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
}

async function calculateOnce() {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText("Giorni di ferie disponibili"), "10");
  await user.click(screen.getByRole("button", { name: "Calcola" }));
  await waitFor(() => expect(calculatePlanSpy).toHaveBeenCalledOnce());

  return user;
}

describe("newsletter signup", () => {
  beforeEach(() => {
    calculatePlanSpy.mockClear();
    installLocalStorage();
    installAnimationFrame();
    window.history.replaceState(null, "", "/");
    vi.restoreAllMocks();
  });

  it("appears only after the first Calcola press and links to the privacy policy", async () => {
    render(React.createElement(VacationPlanner));

    expect(screen.queryByRole("textbox", { name: "Email" })).not.toBeInTheDocument();

    await calculateOnce();

    expect(screen.getByRole("textbox", { name: "Email" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "privacy policy" })).toHaveAttribute(
      "href",
      "/privacy"
    );
  });

  it("requires consent before enabling newsletter submission", async () => {
    render(React.createElement(VacationPlanner));
    const user = await calculateOnce();

    const submitButton = screen.getByRole("button", { name: "Iscrivimi" });
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByRole("textbox", { name: "Email" }), "rares@example.com");
    expect(submitButton).toBeDisabled();

    await user.click(screen.getByLabelText(/trattamento del mio indirizzo email/i));
    expect(submitButton).toBeEnabled();
  });

  it("posts the signup without reloading and shows the confirmation message", async () => {
    const fetchSpy = vi.spyOn(window, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    render(React.createElement(VacationPlanner));
    const user = await calculateOnce();

    await user.type(screen.getByRole("textbox", { name: "Email" }), "rares@example.com");
    await user.click(screen.getByLabelText(/trattamento del mio indirizzo email/i));
    await user.click(screen.getByRole("button", { name: "Iscrivimi" }));

    await waitFor(() =>
      expect(
        screen.getByText("Controlla la tua email per confermare l'iscrizione.")
      ).toBeInTheDocument()
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/newsletter-signup",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "rares@example.com", consent: true }),
      })
    );
  });

  it("treats duplicate subscriptions as a non-fatal UI outcome", async () => {
    vi.spyOn(window, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, duplicate: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    render(React.createElement(VacationPlanner));
    const user = await calculateOnce();

    await user.type(screen.getByRole("textbox", { name: "Email" }), "already@example.com");
    await user.click(screen.getByLabelText(/trattamento del mio indirizzo email/i));
    await user.click(screen.getByRole("button", { name: "Iscrivimi" }));

    await waitFor(() =>
      expect(
        screen.getByText("Controlla la tua email per confermare l'iscrizione.")
      ).toBeInTheDocument()
    );
  });
});
