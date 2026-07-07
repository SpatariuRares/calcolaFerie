import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  test: {
    globals: true,
    include: ["engine/tests/**/*.test.ts", "app/**/*.test.ts"],
    environmentMatchGlobs: [
      ["engine/tests/**", "node"],
      ["app/**", "jsdom"],
    ],
    setupFiles: ["./tests/setup/jest-dom.ts"],
    coverage: {
      provider: "v8",
      include: ["engine/src/**", "app/_lib/**", "app/_components/**"],
      exclude: ["**/*.test.ts", "**/*.spec.ts"],
      reporter: ["text", "html"],
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      "@engine": fileURLToPath(new URL("./engine/src/index.ts", import.meta.url)),
    },
  },
});
