import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import('eslint').Linter.Config[]} */
const config = [
  // Next.js app config (excludes engine/)
  ...compat.extends("next/core-web-vitals", "next/typescript"),

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
