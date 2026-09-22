import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "src/generated/**",
      "eslint.config.js",
      "prisma.config.ts",
      ".env",
      "*.sql",
      "*.md",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "no-console": "off",
    },
  },
  {
    files: ["src/services/**/*.ts", "src/controllers/**/*.ts"],
    ignores: ["src/services/**/index.ts"],
    rules: {
      "no-restricted-imports": ["error", {
        name: "@/lib/prisma",
        importNames: ["prisma"],
        message: "Use the appropriate repository instead of importing prisma directly.",
        allowTypeImports: true,
      }],
    },
  }
);
