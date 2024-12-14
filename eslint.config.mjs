import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import { fixupConfigRules } from "@eslint/compat";


export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
  },
  {
    ignores: ["archive/**"], // Ignore all files within the "archive" directory
  },
  {
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } }
    }
  },
  {
    languageOptions: { globals: globals.browser }
  },
  {
    rules: { "@typescript-eslint/no-explicit-any": "off" } // doesn't work
  },
  {
    env: {
      // ...
      "webextensions": true
    }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...fixupConfigRules(pluginReactConfig),
];