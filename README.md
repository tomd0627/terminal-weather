# ATMOS-1 — Terminal Weather

A retro CLI-aesthetic weather app built for Tom DeLuca's portfolio. Fetches real forecast data from Open-Meteo and presents it through an amber phosphor CRT terminal interface.

---

## Features

- 7-day weather forecast with WMO weather codes rendered as terminal codes (`[CLR]`, `[PRCD]`, `[RAIN]`, `[STRM]`, etc.)
- Location search by city name or automatic geolocation
- Animated boot sequence with character-by-character typing
- Full keyboard navigation — error panels respond to `Y`/`N` keypresses
- `prefers-reduced-motion` respected throughout (boot, scanlines, cursor blink, glow pulse)
- WCAG 2.1 AA compliant

---

## Lighthouse Scores

| Category       | Score |
| -------------- | ----- |
| Performance    | 96    |
| Accessibility  | 95    |
| Best Practices | 100   |
| SEO            | 100   |

---

## Tech Stack

- **Vanilla HTML/CSS/JS** — no framework, no runtime dependencies
- **ES modules** (`type="module"` on the script tag)
- **Open-Meteo** — free weather API, no key required
- **IBM Plex Mono** — Google Fonts, weights 400/500/700
- **Netlify** — static deploy, publish directory is `src/`
- **Dev tooling:** ESLint 8, Stylelint, Prettier, Husky, lint-staged

---

## Color Palette

Amber phosphor CRT, intentionally linked to the portfolio's amber accent (`#ca8a04`).

| Token              | Hex       | Use                                   |
| ------------------ | --------- | ------------------------------------- |
| `--color-bg`       | `#080600` | Screen background                     |
| `--color-phosphor` | `#e8a020` | Primary text                          |
| `--color-bright`   | `#ffd060` | Headers, active values, highlights    |
| `--color-dim`      | `#7a4e0a` | Decorative/structural only (non-text) |
| `--color-ghost`    | `#3d2705` | Very faint decorative lines           |
| `--color-cursor`   | `#ffcc00` | Blinking cursor                       |
| `--color-error`    | `#ff6a14` | Error states                          |
| `--color-prompt`   | `#ffeaa0` | Input text                            |

---

## Project Structure

```
terminal-weather/
├── src/                        # Netlify publish directory
│   ├── index.html
│   ├── css/
│   │   ├── reset.css
│   │   ├── variables.css       # All custom properties
│   │   ├── base.css            # Root, body, focus, skip link
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
├── .eslintrc.json
├── .prettierrc
├── stylelint.config.cjs
├── .husky/pre-commit
├── .lintstagedrc.json
├── netlify.toml
└── package.json
```

---

## Local Development

ES modules require an HTTP server — the `file://` protocol will not work.

```bash
npx serve src
```

Then open `http://localhost:3000`.

---

## Linting

```bash
npm run lint          # run all linters
npm run lint:js       # ESLint only
npm run lint:css      # Stylelint only
npm run lint:format   # Prettier check only
npm run format        # auto-format with Prettier
```

Pre-commit hook runs lint-staged automatically on every commit.

---

## Weather API

- **Geocoding:** `https://geocoding-api.open-meteo.com/v1/search`
- **Forecast:** `https://api.open-meteo.com/v1/forecast`
- Units: Fahrenheit, MPH — 7-day forecast
- No API key required

---

## Deployment

Configured for Netlify via `netlify.toml`:

- Publish directory: `src/`
- Aggressive cache headers on `css/`, `js/`, `assets/`
- `must-revalidate` on HTML
- Full security headers: CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`

Connect the GitHub repository to a Netlify project to deploy.
