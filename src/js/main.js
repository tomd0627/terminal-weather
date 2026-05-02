/**
 * main.js — ATMOS-1 entry point.
 * Phase 2: stubs imported but app logic wired in Phase 3.
 */

import { fetchForecast, getCurrentPosition, searchCities } from "./api.js";
import { playBootSequence, transitionToTerminal } from "./boot.js";
import {
  hideError,
  hideLoading,
  hideSuggestions,
  renderCurrentConditions,
  renderForecast,
  renderSuggestions,
  setStatus,
  showError,
  showLoading,
} from "./ui.js";

/* ── Error message templates (terminal voice) ── */

const ERRORS = {
  NETWORK: {
    code: "[ERR-001]",
    message:
      "CONNECTION TIMEOUT.<br>UNABLE TO REACH WEATHER DATA SERVER.<br>VERIFY NETWORK CONNECTION AND TRY AGAIN.",
  },
  GEOCODE: {
    code: "[ERR-002]",
    message:
      "LOCATION NOT FOUND.<br>CHECK SPELLING AND TRY AGAIN.<br>EXAMPLE: NEW YORK, LONDON, TOKYO",
  },
  GEOLOCATION_DENIED: {
    code: "[ERR-003]",
    message:
      "GEOLOCATION ACCESS DENIED.<br>BROWSER PERMISSIONS BLOCKED.<br>ENTER CITY NAME MANUALLY.",
  },
  GEOLOCATION_UNAVAILABLE: {
    code: "[ERR-004]",
    message: "GEOLOCATION UNAVAILABLE.<br>HARDWARE OR NETWORK ERROR.<br>ENTER CITY NAME MANUALLY.",
  },
  GEOLOCATION_TIMEOUT: {
    code: "[ERR-005]",
    message: "GEOLOCATION TIMED OUT.<br>SIGNAL ACQUISITION FAILED.<br>ENTER CITY NAME MANUALLY.",
  },
  UNKNOWN: {
    code: "[ERR-000]",
    message: "AN UNKNOWN ERROR OCCURRED.<br>PLEASE TRY AGAIN.",
  },
};

/* ── State ── */

let activeCity = null;
let searchDebounceTimer = null;
let suggestionIndex = -1;

/* ── DOM references ── */

const locationInput = document.getElementById("location-input");
const geoBtn = document.getElementById("geo-btn");
const retryBtn = document.getElementById("retry-btn");
const dismissBtn = document.getElementById("dismiss-btn");

/* ── Core: load weather for a given lat/lon and label ── */

async function loadWeather(latitude, longitude, locationLabel) {
  showLoading();
  setStatus("SYS:ONLINE", "NET:CONNECTED");
  activeCity = { latitude, longitude, label: locationLabel };

  try {
    const data = await fetchForecast(latitude, longitude);
    hideLoading();
    renderCurrentConditions(data.current, locationLabel);
    renderForecast(data.daily);
  } catch {
    hideLoading();
    setStatus("SYS:ERROR", "NET:TIMEOUT");
    showError(ERRORS.NETWORK.code, ERRORS.NETWORK.message);
  }
}

/* ── Geolocation handler ── */

async function handleGeolocate() {
  geoBtn.disabled = true;
  geoBtn.textContent = "[...]";
  hideError();

  try {
    const coords = await getCurrentPosition();
    const ns = coords.latitude >= 0 ? "N" : "S";
    const ew = coords.longitude < 0 ? "W" : "E";
    const label = `${Math.abs(coords.latitude).toFixed(2)}°${ns}  ${Math.abs(coords.longitude).toFixed(2)}°${ew}`;
    await loadWeather(coords.latitude, coords.longitude, label);
  } catch (err) {
    const errorKey = err.message in ERRORS ? err.message : "UNKNOWN";
    const error = ERRORS[errorKey];
    showError(error.code, error.message);
    setStatus("SYS:ERROR", "NET:BLOCKED");
  } finally {
    geoBtn.disabled = false;
    geoBtn.textContent = "[GPS]";
  }
}

/* ── City search: debounced input handler ── */

async function handleSearchInput() {
  const query = locationInput.value.trim();
  clearTimeout(searchDebounceTimer);
  suggestionIndex = -1;

  if (query.length < 2) {
    hideSuggestions();
    return;
  }

  searchDebounceTimer = setTimeout(async () => {
    try {
      const cities = await searchCities(query);
      if (cities.length === 0) {
        hideSuggestions();
        return;
      }
      renderSuggestions(cities, handleCitySelect);
    } catch {
      hideSuggestions();
    }
  }, 320);
}

/* ── City selection from suggestions or enter key ── */

async function handleCitySelect(city, label) {
  locationInput.value = label;
  hideSuggestions();
  await loadWeather(city.latitude, city.longitude, label);
}

/* ── Keyboard navigation for suggestion list ── */

function handleSearchKeydown(e) {
  const list = document.getElementById("location-suggestions");
  const items = list.querySelectorAll(".search-suggestions__item");

  if (e.key === "Escape") {
    hideSuggestions();
    return;
  }

  if (e.key === "ArrowDown") {
    e.preventDefault();
    suggestionIndex = Math.min(suggestionIndex + 1, items.length - 1);
    updateSuggestionFocus(items);
    return;
  }

  if (e.key === "ArrowUp") {
    e.preventDefault();
    suggestionIndex = Math.max(suggestionIndex - 1, -1);
    updateSuggestionFocus(items);
    return;
  }

  if (e.key === "Enter") {
    e.preventDefault();
    if (suggestionIndex >= 0 && items[suggestionIndex]) {
      items[suggestionIndex].click();
    }
  }
}

function updateSuggestionFocus(items) {
  items.forEach((item, i) => {
    const selected = i === suggestionIndex;
    item.setAttribute("aria-selected", String(selected));
    if (selected) {
      item.scrollIntoView({ block: "nearest" });
      locationInput.setAttribute("aria-activedescendant", item.id);
    }
  });
  if (suggestionIndex < 0) {
    locationInput.removeAttribute("aria-activedescendant");
  }
}

/* ── Error retry / dismiss ── */

function handleRetry() {
  hideError();
  if (activeCity) {
    loadWeather(activeCity.latitude, activeCity.longitude, activeCity.label);
  } else {
    locationInput.focus();
  }
}

function handleDismiss() {
  hideError();
  locationInput.focus();
}

/* ── Keyboard shortcut: Y / N while error panel is visible ── */

function handleGlobalKeydown(e) {
  const errorPanel = document.getElementById("error-panel");
  if (errorPanel.hidden) return;

  if (e.key === "y" || e.key === "Y") {
    e.preventDefault();
    handleRetry();
  }
  if (e.key === "n" || e.key === "N") {
    e.preventDefault();
    handleDismiss();
  }
}

/* ── Close suggestions when clicking outside ── */

function handleDocumentClick(e) {
  const searchSection = document.querySelector(".search-section");
  if (!searchSection.contains(e.target)) {
    hideSuggestions();
  }
}

/* ── Bootstrap ── */

async function init() {
  /* Wire up event listeners */
  locationInput.addEventListener("input", handleSearchInput);
  locationInput.addEventListener("keydown", handleSearchKeydown);
  geoBtn.addEventListener("click", handleGeolocate);
  retryBtn.addEventListener("click", handleRetry);
  dismissBtn.addEventListener("click", handleDismiss);
  document.addEventListener("keydown", handleGlobalKeydown);
  document.addEventListener("click", handleDocumentClick);

  /* Hide the static Phase 2 design-review content before boot runs */
  const mainContent = document.getElementById("main-content");
  mainContent.setAttribute("hidden", "");

  /* Play boot sequence, then reveal terminal */
  await playBootSequence();
  transitionToTerminal();
}

init();
