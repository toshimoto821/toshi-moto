import playwright from "eslint-plugin-playwright";
import nx from "@nx/eslint-plugin";
import baseConfig from "../../eslint.config.js";

export default [
  // Playwright rules only apply to the e2e tests, not vitest unit specs. The
  // `**/` prefix keeps the glob matching whether eslint runs from the project
  // dir (local) or the repo root (nx in CI).
  {
    ...playwright.configs["flat/recommended"],
    files: ["**/e2e/**/*.{ts,tsx,js,jsx}"],
  },

  ...baseConfig,
  ...nx.configs["flat/react"],
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    // Override or add rules here
    rules: {},
    languageOptions: {
      parserOptions: {
        jsx: true,
      },
    },
  },
];
