const tseslint = require("typescript-eslint");
const js = require("@eslint/js");

module.exports = tseslint.config({
  extends: [js.configs.recommended, ...tseslint.configs.recommended],
  files: ["**/*.{ts,tsx}"],
  rules: {},
});
