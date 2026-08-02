import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["node_modules", "dist", "coverage"]),
  {
    files: [
      "**/*.{ts,tsx}",
      "playwright.config.ts",
      "playwright.global-setup.ts",
      "playwright.global-teardown.ts",
      "e2e/**",
    ],
    ignores: [
      "src/components/ui/**",
      "playwright.config.ts",
      "playwright.local.config.ts",
      "playwright.global-setup.ts",
      "playwright.global-teardown.ts",
      "e2e/**",
    ],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
