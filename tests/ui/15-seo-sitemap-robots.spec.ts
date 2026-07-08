import { describe, it, expect, beforeEach, afterEach } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

const BASE = "https://calcolaferie.it";

describe("sitemap", () => {
  it("returns two entries", () => {
    const entries = sitemap();
    expect(entries).toHaveLength(2);
  });

  it("includes root and privacy with absolute URLs", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(BASE);
    expect(urls).toContain(`${BASE}/privacy`);
  });

  it("entries have lastModified and changeFrequency", () => {
    for (const entry of sitemap()) {
      expect(entry.lastModified).toBeDefined();
      expect(entry.changeFrequency).toBeDefined();
    }
  });

  it("no /api routes in sitemap", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls.every((u) => !u.includes("/api"))).toBe(true);
  });
});

describe("robots", () => {
  it("disallows /api/", () => {
    const r = robots();
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    const disallowed = rules.flatMap((rule) =>
      Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow ?? ""]
    );
    expect(disallowed.some((d) => d === "/api/" || d === "/api")).toBe(true);
  });

  it("sitemap directive points to full sitemap URL", () => {
    const r = robots();
    const sitemapUrl = Array.isArray(r.sitemap) ? r.sitemap[0] : r.sitemap;
    expect(sitemapUrl).toBe(`${BASE}/sitemap.xml`);
  });

  it("allows / and /privacy", () => {
    const r = robots();
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    const allowed = rules.flatMap((rule) =>
      Array.isArray(rule.allow) ? rule.allow : [rule.allow ?? ""]
    );
    expect(allowed).toContain("/");
    expect(allowed).toContain("/privacy");
  });
});
