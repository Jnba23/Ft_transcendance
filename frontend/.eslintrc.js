module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: [
    "react",
    "react-hooks",
    "@typescript-eslint"
  ],
  rules: {
    "react/react-in-jsx-scope": "off",
    // React 18+ doesn't need import React
    "react/prop-types": "off",
    // We use TypeScript instead of PropTypes
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    // "@typescript-eslint/explicit-function-return-types": "error",
    "semi": ["error", "always"],
    "quotes": ["error", "double"],
    "indent": ["error", 2],
    "no-console": "warn"
  },
  settings: {
    react: {
      version: "detect"
    }
  }
};