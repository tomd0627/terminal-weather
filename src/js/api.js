const GEOCODING_BASE = "https://geocoding-api.open-meteo.com/v1";
const FORECAST_BASE = "https://api.open-meteo.com/v1";

/**
 * Search for cities by name. Returns up to 5 results.
 * @param {string} query - City name to search.
 * @returns {Promise<Array<{name, country, admin1, latitude, longitude}>>}
 */
export async function searchCities(query) {
  const url = new URL(`${GEOCODING_BASE}/search`);
  url.searchParams.set("name", query.trim());
  url.searchParams.set("count", "5");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`GEOCODING ERROR: HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.results ?? [];
}

/**
 * Fetch current conditions + 7-day forecast for given coordinates.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{current: object, daily: object}>}
 */
export async function fetchForecast(latitude, longitude) {
  const url = new URL(`${FORECAST_BASE}/forecast`);
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
    ].join(",")
  );
  url.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
    ].join(",")
  );
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("wind_speed_unit", "mph");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "7");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`FORECAST ERROR: HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Get current position via browser Geolocation API.
 * @returns {Promise<GeolocationCoordinates>}
 */
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("GEOLOCATION_UNAVAILABLE"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      (err) => {
        const messages = {
          1: "GEOLOCATION_DENIED",
          2: "GEOLOCATION_UNAVAILABLE",
          3: "GEOLOCATION_TIMEOUT",
        };
        reject(new Error(messages[err.code] ?? "GEOLOCATION_UNKNOWN"));
      },
      { timeout: 10_000, maximumAge: 60_000 }
    );
  });
}
