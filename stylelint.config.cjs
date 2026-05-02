"use strict";

module.exports = {
  plugins: ["stylelint-order", "stylelint-use-logical"],
  rules: {
    // Alphabetical property order
    "order/properties-alphabetical-order": true,

    // Logical properties instead of physical
    "csstools/use-logical": [
      true,
      {
        // text-size-adjust has no standard logical equivalent yet
        except: ["text-size-adjust"],
      },
    ],

    // No duplicate selectors across files
    "no-duplicate-selectors": true,

    // No vendor prefixes (browser support is assumed modern)
    "property-no-vendor-prefix": [true, { disableFix: false }],
    "value-no-vendor-prefix": [true, { disableFix: false }],
    "selector-no-vendor-prefix": true,
  },
};
