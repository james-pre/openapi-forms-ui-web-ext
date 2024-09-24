import globals from "globals";
import pluginJs from "@eslint/js";
import tsEslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginTanstackQuery from "@tanstack/eslint-plugin-query";
import pluginEslintPrettier from "eslint-config-prettier";
import { fixupPluginRules } from "@eslint/compat";

export default tsEslint.config(
  pluginJs.configs.recommended,
  ...tsEslint.configs.recommendedTypeChecked,
  { ...pluginReact.configs.flat.recommended },
  {
    plugins: { "react-hooks": fixupPluginRules(pluginReactHooks) },
    rules: { ...pluginReactHooks.configs.recommended.rules },
  },
  ...pluginTanstackQuery.configs["flat/recommended"],
  { ...pluginEslintPrettier },
  {
    // files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "react/prop-types": "off",
    },
  },
);
