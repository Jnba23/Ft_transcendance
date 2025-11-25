module.exports = {
  env: {
    node: true,
    es2021: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: [
    "@typescript-eslint"
  ],
  rules: {
    "no-unused-vars": "off",
    // Turn off the default JavaScript rule because it doesn't understand TypeScript
    
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    // Use the TypeScript version instead
    // This WARNS (doesn't error) if you declare variables/imports you don't use
    // BUT allows unused function parameters that start with underscore
    // Example: function process(data, _metadata) { } // _metadata won't trigger warning
    
    // "@typescript-eslint/explicit-function-return-types": "error",
    // (Currently commented out) Would ERROR if functions don't explicitly state return type
    // Example: function getName(): string { return "John"; } ✓
    // Example: function getName() { return "John"; } ✗
    
    "semi": ["error", "always"],
    // ERROR if you forget semicolons at the end of statements
    // Example: const x = 5; ✓
    // Example: const x = 5  ✗
    
    "quotes": ["error", "single"],
    // ERROR if you use double quotes instead of single quotes
    // Example: const name = 'John'; ✓
    // Example: const name = "John"; ✗
    
    "indent": ["error", 2],
    // ERROR if you don't use exactly 2 spaces for indentation
    // Example:
    // if (true) {
    //   doSomething(); ✓ (2 spaces)
    // }
    // if (true) {
    //     doSomething(); ✗ (4 spaces)
    // }
    
    "no-console": "warn"
    // WARN (doesn't fail build) if you have console.log statements
    // Reminder to remove debug logs before committing
  }
};