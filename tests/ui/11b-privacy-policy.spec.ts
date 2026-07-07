// @vitest-environment jsdom

import React from "react";
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NewsletterConsentText } from "../../app/_components/newsletter-consent-text";
import { VacationPlanner } from "../../app/_components/vacation-planner";
import PrivacyPage from "../../app/privacy/page";

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

describe("privacy policy", () => {
  beforeEach(() => {
    installLocalStorage();
    installAnimationFrame();
    window.history.replaceState(null, "", "/");
  });

  it("is reachable from the planner", () => {
    render(React.createElement(VacationPlanner));

    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
  });

  it("names newsletter data, purpose, consent, provider, unsubscribe, and contact", () => {
    render(React.createElement(PrivacyPage));

    expect(screen.getByRole("heading", { level: 1, name: "Privacy policy" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Torna al planner" })).toHaveAttribute("href", "/");

    expect(screen.getByText(/indirizzo email/i)).toBeInTheDocument();
    expect(screen.getByText(/aggiornamenti su CalcolaFerie/i)).toBeInTheDocument();
    expect(screen.getByText(/consenso esplicito/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Buttondown/i)).toHaveLength(2);
    expect(screen.getByText(/unsubscribe/i)).toBeInTheDocument();

    const privacyRequests = screen.getByRole("heading", {
      name: "Richieste privacy",
    }).parentElement;
    expect(privacyRequests).not.toBeNull();
    expect(
      within(privacyRequests as HTMLElement).getByRole("link", { name: "SpatariuRares" })
    ).toHaveAttribute("href", "https://github.com/SpatariuRares");
  });

  it("provides reusable newsletter consent text linked to the privacy policy", () => {
    render(React.createElement(NewsletterConsentText));

    expect(screen.getByText(/trattamento del mio indirizzo email/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "privacy policy" })).toHaveAttribute(
      "href",
      "/privacy"
    );
  });

  it("does not publish a newsletter signup form without a privacy link", () => {
    render(React.createElement(VacationPlanner));

    expect(screen.queryByRole("textbox", { name: /email/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
  });
});
