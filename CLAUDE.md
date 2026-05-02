# CLAUDE.md — ATMOS-1 Terminal Weather

This file is read at the start of every session. It contains standing project context, conventions, and constraints.

---

## Project Overview

**ATMOS-1** is a retro CLI-aesthetic weather app for Tom DeLuca's portfolio. It fetches real forecast data from Open-Meteo and presents it in an amber phosphor CRT terminal aesthetic. Deployed to Netlify as a static site — no build step, no framework.

---

## Tech Stack

- **Runtime:** Vanilla HTML/CSS/JS — no framework, no runtime dependencies
- **JS:** ES modules (`type="module"` on the script tag; deferred by default)
- **CSS:** Custom properties, CSS logical properties, CSS Grid/Flexbox — no utility classes
- **Weather data:** Open-Meteo (free, no API key required)
- **Deployment:** Netlify — publish directory is `src/`
- **Dev tooling:** Husky, lint-staged, Prettier, ESLint 8, Stylelint (Phase 4)

---

## File Structure

```
terminal-weather/
├── src/                        # Netlify publish directory
│   ├── index.html
│   ├── css/
│   │   ├── reset.css           # Modern CSS reset
│   │   ├── variables.css       # All custom properties
│   │   ├── base.css            # Root, body, focus, selection, skip link
│   │   ├── layout.css          # Screen wrapper, CRT effects, terminal frame
│   │   ├── components.css      # All UI components
│   │   ├── animations.css      # Keyframes + animation assignments
│   │   └── responsive.css      # Breakpoint overrides
│   ├── js/
│   │   ├── main.js             # Entry point and event wiring
│   │   ├── boot.js             # Boot sequence animation
│   │   ├── api.js              # Open-Meteo API calls + geolocation
│   │   ├── ui.js               # DOM rendering functions
│   │   └── utils.js            # WMO code map, formatters, helpers
│   └── assets/
│       └── favicon.svg
├── .eslintrc.json              # Phase 4
├── .prettierrc                 # Phase 4
├── stylelint.config.js         # Phase 4
├── .husky/pre-commit           # Phase 4
├── .lintstagedrc.json          # Phase 4
├── netlify.toml                # Phase 4
├── package.json                # Phase 4
├── CLAUDE.md                   # This file
├── HANDOFF.md                  # Session continuity
└── README.md
```

---

## Color Palette (Amber Phosphor CRT)

| Token | Hex | Use |
|---|---|---|
| `--color-bg` | `#080600` | Screen background |
| `--color-phosphor` | `#e8a020` | Primary text |
| `--color-bright` | `#ffd060` | Headers, active values, highlights |
| `--color-dim` | `#7a4e0a` | Secondary labels, borders (non-text only) |
| `--color-ghost` | `#3d2705` | Decorative structure, very faint lines |
| `--color-cursor` | `#ffcc00` | Blinking cursor |
| `--color-error` | `#ff6a14` | Error states |
| `--color-prompt` | `#ffeaa0` | Input text |

`--color-dim` (#7a4e0a) is used only for decorative/structural elements — never for body copy or informational text (contrast ~2.6:1 against bg).

---

## Typeface

**IBM Plex Mono** — loaded from Google Fonts, weights 400/500/700 + italic 400.
Fallback: `'Courier New', Courier, monospace`.
No secondary typeface. The terminal aesthetic requires mono purity.

---

## Weather API

**Open-Meteo** — no API key required.
- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Forecast: `https://api.open-meteo.com/v1/forecast`
- Units: Fahrenheit, MPH
- Forecast days: 7
- All WMO weather codes (0–99) are mapped in `src/js/utils.js → wmoToDisplay()`

---

## CSS Conventions

These are enforced by Stylelint (Phase 4). Follow them now to avoid lint failures later:

1. **Alphabetize all CSS properties** within each rule block.
2. **Use CSS logical properties** — never physical directional properties:
   - `margin-inline` not `margin-left`/`margin-right`
   - `padding-block` not `padding-top`/`padding-bottom`
   - `inset` not `top`/`right`/`bottom`/`left`
   - `inline-size` not `width` (for directional sizing)
   - `block-size` not `height` (for directional sizing)
3. **No vendor prefixes** (except `text-size-adjust` in reset, which has no standard alternative yet).
4. **No duplicate selectors.**
5. All animation/motion must respect `@media (prefers-reduced-motion: reduce)` — see `animations.css`.

---

## JS Conventions

These are enforced by ESLint (Phase 4):

- No `console.log` (use no-console rule)
- Strict equality (`===`) only
- No unused variables
- ES module syntax (`import`/`export`) throughout

---

## Accessibility Targets

- WCAG 2.1 AA minimum
- Lighthouse Accessibility ≥ 95 before deploy
- All interactive elements have visible, styled focus indicators (see `:focus-visible` in `base.css`)
- `prefers-reduced-motion` respected for all animations
- Screen reader: boot sequence uses `role="log"` + `aria-live="polite"`; error panel uses `aria-live="assertive"`

---

## Local Development

ES modules require HTTP — open via a local server, not `file://`:

```
npx serve src
```

Then open `http://localhost:3000`.

---

## Boot Sequence Behavior

- On page load: `main.js` immediately hides `#main-content`, then calls `playBootSequence()` in `boot.js`
- Boot animates lines to `#boot-output` one character at a time
- After boot completes: `transitionToTerminal()` hides boot, reveals terminal, focuses the location input
- With `prefers-reduced-motion`: all lines render instantly with a 300ms pause before transition

---

## Error Voice

All user-facing error messages use terminal voice, all-caps. Examples:
- `CONNECTION TIMEOUT. VERIFY NETWORK CONNECTION AND TRY AGAIN.`
- `LOCATION NOT FOUND. CHECK SPELLING AND TRY AGAIN.`
- `GEOLOCATION ACCESS DENIED. ENTER CITY NAME MANUALLY.`

Error panels always include a `RETRY? [Y/N]` prompt. `Y` retries the last request; `N` dismisses and focuses the input. Keyboard shortcuts `y`/`n` also trigger these while the error panel is visible.
