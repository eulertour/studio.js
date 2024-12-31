import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

import globals from "globals";

export default tseslint.config(
  // Global configuration
  eslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
  },

  // TypeScript configuration
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        projectService: true,
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      ...tseslint.configs.strictTypeChecked.rules,
      ...tseslint.configs.stylisticTypeChecked.rules,
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "error",
    },
  },

  // Turn off rules that might conflict with prettier
  prettier,

  // Global ignore rules
  {
    ignores: ["build/", "node_modules/"],
  },
);
