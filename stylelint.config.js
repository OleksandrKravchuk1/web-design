// Stylelint: standard SCSS rules + checks taken from the ЛР3 checklist.
const BEM = "^(dt-)?[a-z0-9]+(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$";

export default {
  extends: ["stylelint-config-standard-scss"],
  plugins: ["stylelint-order"],
  ignoreFiles: ["dist/**", "node_modules/**"],
  rules: {
    // block__element--modifier, optional dt- prefix (utilities have none)
    "selector-class-pattern": [BEM, { message: (selector) => `Expected BEM class name, got "${selector}"` }],
    // "nesting no deeper than two levels", no IDs
    "selector-max-compound-selectors": 2,
    "selector-max-id": 0,
    "max-nesting-depth": [2, { ignoreAtRules: ["include", "media", "supports"] }],
    // @use / @forward only
    "at-rule-disallowed-list": ["import"],
    // custom properties, variables, mixins without block, declarations, nested rules
    "order/order": [
      "custom-properties",
      "dollar-variables",
      { type: "at-rule", name: "include", hasBlock: false },
      "declarations",
      { type: "at-rule", name: "include", hasBlock: true },
      "rules",
    ],
    // private module members may start with "_"
    "scss/dollar-variable-pattern": "^_?[a-z][a-z0-9-]*$",
    "scss/dollar-variable-empty-line-before": null,
    "custom-property-pattern": "^dt-[a-z0-9-]+$",
    "keyframes-name-pattern": "^dt-[a-z0-9-]+$",
  },
  overrides: [
    {
      // "no literal HEX codes in components" — colours come from tokens only
      files: ["src/styles/components/**", "src/styles/layout/**", "src/styles/pages/**"],
      rules: {
        "color-no-hex": true,
        "color-named": "never",
        "function-disallowed-list": ["rgb", "rgba", "hsl", "hsla"],
      },
    },
  ],
};
