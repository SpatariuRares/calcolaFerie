import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "../mocks/server";

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
