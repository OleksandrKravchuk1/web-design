import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["dist/", "node_modules/"] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser },
    },
    rules: {
      "no-console": "off",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-undef": "error",
      eqeqeq: ["warn", "always"],
      curly: ["warn", "all"],
    },
  },
  {
    files: ["vite.config.js", "eslint.config.js", "scripts/**/*.js"],
    languageOptions: { globals: { ...globals.node } },
  },
];
