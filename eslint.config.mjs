import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: ["coverage/**", "playwright-report/**", "test-results/**"],
  },

  // Next.js app config (excludes engine/)
  ...nextCoreWebVitals,
  ...nextTypescript,
  // Engine-specific: ban next and react imports
  {
    files: ["engine/**/*.ts"],
    plugins: {
      "@typescript-eslint": tsPlugin,
      import: importPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./engine/tsconfig.json",
      },
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["next", "next/*"],
              message: "engine/ must not import from Next.js",
            },
            {
              group: ["react", "react/*", "react-dom", "react-dom/*"],
              message: "engine/ must not import from React",
            },
          ],
        },
      ],
    },
  },
];

export default config;
