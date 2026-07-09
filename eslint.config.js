import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist", "node_modules"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}", "*.config.{js,ts}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "simple-import-sort": simpleImportSort
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "separate-type-imports", prefer: "type-imports" }
      ],
      "comma-spacing": ["error", { before: false, after: true }],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["./*", "../*"],
              message: "Use the @src/* alias for source imports."
            }
          ]
        }
      ],
      "object-curly-spacing": ["error", "always"],
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true, allowExportNames: ["PET_TILES", "formatTime"] }
      ],
      "simple-import-sort/exports": "error",
      "simple-import-sort/imports": "error"
    }
  },
  {
    files: ["src/assets/pets.tsx"],
    rules: {
      "react-refresh/only-export-components": "off"
    }
  }
);
