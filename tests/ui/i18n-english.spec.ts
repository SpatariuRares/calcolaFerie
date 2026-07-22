// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import englishMessages from "../../messages/en.json";
import PrivacyPage from "../../app/privacy/page";

describe("English translations", () => {
  it("renders the privacy page from the real English provider", () => {
    render(
      React.createElement(
        NextIntlClientProvider,
        { locale: "en", messages: englishMessages },
        React.createElement(PrivacyPage)
      )
    );

    expect(screen.getByRole("link", { name: "Back to planner" })).toHaveAttribute("href", "/");
    expect(
      screen.getByRole("heading", { level: 2, name: "Controller and contact" })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "privacy@calcolaferie.it" })).toHaveLength(2);
    for (const emailLink of screen.getAllByRole("link", { name: "privacy@calcolaferie.it" })) {
      expect(emailLink).toHaveAttribute("href", "mailto:privacy@calcolaferie.it");
    }
  });
});
