/**
 * WMO Weather Interpretation Code → terminal display data.
 * Codes per WMO 4677 standard used by Open-Meteo.
 * Returns { code: string, description: string } or null.
 */
export function wmoToDisplay(wmoCode) {
  const map = new Map([
    [0, { code: "CLR", description: "CLEAR SKIES" }],
    [1, { code: "MCLR", description: "MAINLY CLEAR" }],
    [2, { code: "PRCD", description: "PARTLY CLOUDY" }],
    [3, { code: "CLDS", description: "OVERCAST" }],
    [45, { code: "FOG", description: "FOG" }],
    [48, { code: "FOG", description: "ICING FOG" }],
    [51, { code: "DRZL", description: "LIGHT DRIZZLE" }],
    [53, { code: "DRZL", description: "DRIZZLE" }],
    [55, { code: "DRZL", description: "HEAVY DRIZZLE" }],
    [56, { code: "FRZR", description: "FREEZING DRIZZLE" }],
    [57, { code: "FRZR", description: "HEAVY FREEZING DRIZZLE" }],
    [61, { code: "RAIN", description: "LIGHT RAIN" }],
    [63, { code: "RAIN", description: "RAIN" }],
    [65, { code: "RAIN", description: "HEAVY RAIN" }],
    [66, { code: "FRZR", description: "FREEZING RAIN" }],
    [67, { code: "FRZR", description: "HEAVY FREEZING RAIN" }],
    [71, { code: "SNOW", description: "LIGHT SNOW" }],
    [73, { code: "SNOW", description: "SNOW" }],
    [75, { code: "SNOW", description: "HEAVY SNOW" }],
    [77, { code: "SNWG", description: "SNOW GRAINS" }],
    [80, { code: "SHWR", description: "LIGHT SHOWERS" }],
    [81, { code: "SHWR", description: "SHOWERS" }],
    [82, { code: "SHWR", description: "HEAVY SHOWERS" }],
    [85, { code: "SNWS", description: "SNOW SHOWERS" }],
    [86, { code: "SNWS", description: "HEAVY SNOW SHOWERS" }],
    [95, { code: "STRM", description: "THUNDERSTORM" }],
    [96, { code: "HAIL", description: "STORM WITH HAIL" }],
    [99, { code: "HAIL", description: "HEAVY STORM WITH HAIL" }],
  ]);

  return map.get(wmoCode) ?? { code: "????", description: "UNKNOWN CONDITIONS" };
}

/**
 * Format a bearing in degrees (0–360) to a compass direction string.
 */
export function degreesToCompass(degrees) {
  const dirs = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return dirs[index];
}

/**
 * Format an ISO date string (YYYY-MM-DD) to terminal format (MON DD/MM).
 */
export function formatForecastDate(isoDate, isToday = false) {
  const date = new Date(isoDate + "T12:00:00");
  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const day = dayNames[date.getDay()];
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const dayNum = String(date.getDate()).padStart(2, "0");
  return isToday ? `TODAY` : `${day} ${month}/${dayNum}`;
}

/**
 * Format a timestamp to terminal display: HH:MM TZ
 */
export function formatUpdateTime(date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `UPDATED ${h}:${m}`;
}

/**
 * Round a float temperature to the nearest integer string.
 */
export function formatTemp(value) {
  return String(Math.round(value));
}

/**
 * Clamp a value between min and max.
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Check if prefers-reduced-motion is active.
 */
export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
