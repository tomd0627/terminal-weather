import {
  wmoToDisplay,
  degreesToCompass,
  formatForecastDate,
  formatTemp,
  formatUpdateTime,
} from "./utils.js";

/** Render current conditions into the DOM. */
export function renderCurrentConditions(current, locationName) {
  const el = (id) => document.getElementById(id);

  el("current-location").textContent = locationName.toUpperCase();

  const temp = formatTemp(current.temperature_2m);
  const feelsLike = formatTemp(current.apparent_temperature);
  el("current-temp").textContent = temp;
  el("current-temp").setAttribute("aria-label", `Current temperature: ${temp} degrees Fahrenheit`);
  el("feels-like").textContent = feelsLike;

  const wx = wmoToDisplay(current.weather_code);
  el("weather-desc").innerHTML =
    `<span class="wx-code" aria-hidden="true">${wx.code}</span> ${wx.description}`;

  el("humidity").textContent = String(Math.round(current.relative_humidity_2m));

  const windSpeed = Math.round(current.wind_speed_10m);
  const windDir = degreesToCompass(current.wind_direction_10m);
  el("wind-speed").textContent = String(windSpeed);
  el("wind-dir").textContent = ` ${windDir}`;
  el("wind-dir").setAttribute("aria-label", `wind direction: ${windDir}`);

  el("last-updated").textContent = formatUpdateTime(new Date());

  document.getElementById("current-conditions").removeAttribute("hidden");
}

/** Render 7-day forecast rows into the DOM. */
export function renderForecast(daily) {
  const container = document.getElementById("forecast-rows");
  const today = new Date().toISOString().slice(0, 10);
  container.innerHTML = "";

  daily.time.forEach((isoDate, i) => {
    const isToday = isoDate === today;
    const wx = wmoToDisplay(daily.weather_code[i]);
    const hi = formatTemp(daily.temperature_2m_max[i]);
    const lo = formatTemp(daily.temperature_2m_min[i]);
    const precip = daily.precipitation_probability_max[i] ?? 0;
    const precipHigh = precip >= 60;
    const dayLabel = formatForecastDate(isoDate, isToday);

    const row = document.createElement("div");
    row.className = "forecast__row";
    row.setAttribute("role", "row");
    row.innerHTML = `
      <span class="forecast__day${isToday ? " forecast__day--today" : ""}" role="cell">${dayLabel}</span>
      <span class="forecast__condition" role="cell">
        <span class="wx-code" aria-hidden="true">${wx.code}</span>
        ${wx.description}
      </span>
      <span class="forecast__temp-hi" role="cell" aria-label="High: ${hi} degrees">${hi}°</span>
      <span class="forecast__temp-lo" role="cell" aria-label="Low: ${lo} degrees">${lo}°</span>
      <span class="forecast__precip${precipHigh ? " forecast__precip--high" : ""}" role="cell" aria-label="${precip}% chance of precipitation">${precip}%</span>
    `;
    container.appendChild(row);
  });

  document.getElementById("forecast-section").removeAttribute("hidden");
}

/** Render city suggestion items into the dropdown. */
export function renderSuggestions(cities, onSelect) {
  const list = document.getElementById("location-suggestions");
  const input = document.getElementById("location-input");
  list.innerHTML = "";

  if (cities.length === 0) {
    list.setAttribute("hidden", "");
    input.setAttribute("aria-expanded", "false");
    return;
  }

  cities.forEach((city, index) => {
    const label = [city.name, city.admin1, city.country].filter(Boolean).join(", ").toUpperCase();

    const item = document.createElement("li");
    item.className = "search-suggestions__item";
    item.setAttribute("role", "option");
    item.setAttribute("id", `suggestion-${index}`);
    item.setAttribute("aria-selected", "false");
    item.textContent = label;
    item.addEventListener("click", () => onSelect(city, label));
    list.appendChild(item);
  });

  list.removeAttribute("hidden");
  input.setAttribute("aria-expanded", "true");
}

/** Hide the suggestion dropdown. */
export function hideSuggestions() {
  const list = document.getElementById("location-suggestions");
  const input = document.getElementById("location-input");
  list.setAttribute("hidden", "");
  list.innerHTML = "";
  input.setAttribute("aria-expanded", "false");
}

/** Show an error panel with terminal-voice messaging. */
export function showError(code, message) {
  const panel = document.getElementById("error-panel");
  document.getElementById("error-code").textContent = code;
  document.getElementById("error-message").innerHTML = message;
  panel.removeAttribute("hidden");
}

/** Hide the error panel. */
export function hideError() {
  document.getElementById("error-panel").setAttribute("hidden", "");
}

/** Show the loading indicator (replaces current/forecast panels while loading). */
export function showLoading() {
  const current = document.getElementById("current-conditions");
  const forecast = document.getElementById("forecast-section");
  if (current) current.setAttribute("hidden", "");
  if (forecast) forecast.setAttribute("hidden", "");
  hideError();

  let indicator = document.getElementById("loading-indicator");
  if (!indicator) {
    indicator = document.createElement("div");
    indicator.id = "loading-indicator";
    indicator.className = "loading-indicator";
    indicator.setAttribute("aria-live", "polite");
    indicator.setAttribute("aria-label", "Loading weather data");
    indicator.textContent = "FETCHING ATMOSPHERIC DATA";
    document
      .getElementById("main-content")
      .insertBefore(indicator, document.getElementById("current-conditions"));
  }
  indicator.removeAttribute("hidden");
}

/** Hide the loading indicator. */
export function hideLoading() {
  const indicator = document.getElementById("loading-indicator");
  if (indicator) indicator.setAttribute("hidden", "");
}

/** Update the system status indicators in the header. */
export function setStatus(sysState, netState) {
  const sys = document.getElementById("sys-status");
  const net = document.getElementById("net-status");
  if (sys && sysState) {
    sys.textContent = sysState;
    sys.className = `terminal__status-indicator terminal__status-indicator--${sysState === "SYS:ONLINE" ? "online" : "error"}`;
  }
  if (net && netState) {
    net.textContent = netState;
  }
}
