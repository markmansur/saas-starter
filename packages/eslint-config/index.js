import { config, configs } from "typescript-eslint";
import lintjs from "@eslint/js";

export default config({
  extends: [lintjs.configs.recommended, ...configs.recommended],
  files: ["**/*.{ts,tsx}"],
  rules: {},
});
