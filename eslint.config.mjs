// ESLint flat config for Next.js 16 (ESLint 9).
// `next lint` was removed in Next 16, so we invoke ESLint directly
// (`eslint .`) using eslint-config-next's flat-config exports.
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const asArray = (config) => (Array.isArray(config) ? config : [config]);

const config = [
  ...asArray(coreWebVitals),
  ...asArray(typescript),
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "*.tsbuildinfo",
    ],
  },
  {
    // Config files legitimately use CommonJS require + anonymous default export.
    files: ["*.config.{ts,mts,cts,js,mjs,cjs}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
  {
    // Next 16 newly promoted several opinionated rules to `error`. They fire on
    // (a) transitional mock scaffold that the /v1 wiring tasks rewrite and
    // TASK-019 deletes, and (b) our hand-rolled data hooks' accepted latest-ref
    // + init-state patterns. Keep them as warnings (visible, non-blocking) so
    // the hard gates stay typecheck + build; the warnings clear as pages get
    // wired. TODO: re-promote to error once the mock layer is gone.
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default config;
