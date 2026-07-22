import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "../mocks/server";

vi.mock("next-intl", async () => {
  const actual = await vi.importActual<typeof import("next-intl")>("next-intl");
  const { default: messages } = await import("../../messages/it.json");
  const fallback = (namespace?: string) =>
    actual.createTranslator({
      locale: "it",
      messages,
      namespace: namespace as never,
    });

  return {
    ...actual,
    useLocale: () => {
      try {
        return actual.useLocale();
      } catch {
        return "it";
      }
    },
    useTranslations: (namespace?: string) => {
      try {
        return actual.useTranslations(namespace as never);
      } catch {
        return fallback(namespace);
      }
    },
  };
});

vi.mock("next/font/google", () => ({
  Playfair_Display: () => ({
    className: "font-display",
    variable: "--font-display",
    style: { fontFamily: "Playfair Display" },
  }),
}));

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
