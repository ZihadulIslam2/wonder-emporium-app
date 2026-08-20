const js = require("@eslint/js");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const prettier = require("eslint-config-prettier");
const unusedImports = require("eslint-plugin-unused-imports");

module.exports = [
  {
    ignores: ["node_modules/", "dist/", "build/", ".expo/", "ios/", "android/", "eslint.config.js"],
  },
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": tsPlugin,
      "unused-imports": unusedImports,
    },
    languageOptions: {
      parser: tsParser,
      globals: {
        process: "readonly",
        console: "readonly",
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        window: "readonly",
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "unused-imports/no-unused-imports": "warn",
      "no-console": "warn",
    },
  },
  prettier,
];
