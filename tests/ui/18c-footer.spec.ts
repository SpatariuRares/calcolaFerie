// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VacationPlanner } from "../../app/_components/templates/vacation-planner";

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

describe("footer", () => {
  beforeEach(() => {
    installLocalStorage();
    installAnimationFrame();
    window.history.replaceState(null, "", "/");
    vi.unstubAllEnvs();
  });

  it("shows gestore and contact email", () => {
    render(React.createElement(VacationPlanner));

    expect(screen.getByText(/Gestore: Spatariu Rares/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "privacy@calcolaferie.it" })).toHaveAttribute(
      "href",
      "mailto:privacy@calcolaferie.it"
    );
  });

  it("does not render P.IVA line when env var is absent", () => {
    render(React.createElement(VacationPlanner));

    expect(screen.queryByText(/P\.IVA:/)).not.toBeInTheDocument();
  });

  it("renders P.IVA line when env var is present", () => {
    vi.stubEnv("NEXT_PUBLIC_PIVA", "IT12345678901");
    render(React.createElement(VacationPlanner));

    expect(screen.getByText(/P\.IVA: IT12345678901/)).toBeInTheDocument();
  });

  it("keeps the Privacy link functional", () => {
    render(React.createElement(VacationPlanner));

    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
  });
});
