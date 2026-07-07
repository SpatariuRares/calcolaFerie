import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          environment: "node",
          include: ["engine/tests/**/*.test.ts", "tests/engine/**/*.spec.ts"],
          name: "engine",
        },
      },
      {
        extends: true,
        test: {
          environment: "jsdom",
          include: ["tests/ui/**/*.spec.ts", "app/**/*.test.ts"],
          name: "ui",
        },
      },
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
