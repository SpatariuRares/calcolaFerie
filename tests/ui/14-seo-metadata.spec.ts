// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { existsSync } from "fs";
import { join } from "path";
import { metadata } from "../../app/layout";

vi.mock("../../app/_components/templates/vacation-planner", () => ({
  VacationPlanner: () => React.createElement("div", { "data-testid": "vacation-planner" }),
}));

describe("issue 14 – SEO metadata", () => {
  describe("title", () => {
    it("is exactly correct", () => {
      expect(metadata.title).toBe("CalcolaFerie — Calcolatore Ponti e Ferie Italiane");
    });
  });

  describe("description", () => {
    it("contains target keyword", () => {
      expect(metadata.description).toMatch(/calcolatore ponti ferie/i);
    });

    it("is under 160 characters", () => {
      expect((metadata.description as string).length).toBeLessThanOrEqual(160);
    });
  });

  describe("Open Graph", () => {
    it("has all required tags", () => {
      const og = metadata.openGraph as Record<string, unknown>;
      expect(og.title).toBeTruthy();
      expect(og.description).toBeTruthy();
      expect(og.images).toBeTruthy();
      expect(og.url).toBeTruthy();
      expect(og.type).toBeTruthy();
    });

    it("og:image is absolute URL pointing to og-image.png", () => {
      const og = metadata.openGraph as Record<string, unknown>;
      const images = Array.isArray(og.images) ? og.images : [og.images];
      const first = images[0] as string | { url: string };
      const imgUrl = typeof first === "string" ? first : first.url;
      expect(imgUrl).toMatch(/^https?:\/\/.+\/og-image\.png$/);
    });
  });

  describe("Twitter Card", () => {
    it("has required tags", () => {
      const tw = metadata.twitter as Record<string, unknown>;
      expect(tw.card).toBeTruthy();
      expect(tw.title).toBeTruthy();
      expect(tw.description).toBeTruthy();
      expect(tw.images).toBeTruthy();
    });
  });

  describe("og-image asset", () => {
    it("public/og-image.png exists", () => {
      expect(existsSync(join(process.cwd(), "public", "og-image.png"))).toBe(true);
    });
  });

  describe("page static content", () => {
    beforeEach(() => {
      window.history.replaceState(null, "", "/");
    });

    it("renders heading with target keyword", async () => {
      const { default: HomePage } = await import("../../app/page");
      render(React.createElement(HomePage));
      expect(
        screen.getByRole("heading", { name: /calcolatore ponti ferie/i })
      ).toBeInTheDocument();
    });

    it("renders paragraph with festività italiane and ottimizzare ferie", async () => {
      const { default: HomePage } = await import("../../app/page");
      render(React.createElement(HomePage));
      const body = document.body.textContent ?? "";
      expect(body).toMatch(/festività italiane/i);
      expect(body).toMatch(/ottimizzare.*ferie|ferie.*ottimizzare/i);
    });
  });
});
