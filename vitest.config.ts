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
          include: [
            "engine/tests/**/*.test.ts",
            "packages/engine-rag/tests/**/*.test.ts",
            "packages/content-generation/tests/**/*.test.ts",
            "tests/engine/**/*.spec.ts",
          ],
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
      include: [
        "engine/src/**",
        "packages/engine-rag/src/**",
        "packages/content-generation/src/**",
        "app/_lib/**",
        "app/_components/**",
      ],
      exclude: ["**/*.test.ts", "**/*.spec.ts"],
      reporter: ["text", "html"],
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      "@engine": fileURLToPath(new URL("./engine/src/index.ts", import.meta.url)),
      "@engine-rag": fileURLToPath(new URL("./packages/engine-rag/src/index.ts", import.meta.url)),
      "@content-generation": fileURLToPath(new URL("./packages/content-generation/src/index.ts", import.meta.url)),
      "@components": fileURLToPath(new URL("./app/_components", import.meta.url)),
      "@lib": fileURLToPath(new URL("./app/_lib", import.meta.url)),
      "@styles": fileURLToPath(new URL("./app/styles", import.meta.url)),
      "@i18n": fileURLToPath(new URL("./i18n", import.meta.url)),
    },
  },
});
