import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  test: {
    include: ["engine/tests/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@engine": fileURLToPath(new URL("./engine/src", import.meta.url)),
    },
  },
});
