import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  test: {
    include: ["engine/tests/**/*.test.ts", "app/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      "@engine": fileURLToPath(new URL("./engine/src/index.ts", import.meta.url)),
    },
  },
});
