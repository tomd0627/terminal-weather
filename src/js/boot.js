import { prefersReducedMotion } from "./utils.js";

const BOOT_LINES = [
  { text: "ATMOS-1 ATMOSPHERIC DATA TERMINAL", cls: "boot__line--heading" },
  { text: "BIOS REVISION 2.3.1 // BUILD 19831021", cls: "boot__line--dim" },
  { text: "─────────────────────────────────────────────────────", cls: "boot__separator" },
  { text: "HARDWARE INITIALIZATION", cls: "boot__line" },
  { text: "─────────────────────────────────────────────────────", cls: "boot__separator" },
  { text: "CPU: Z80A @ 4.000 MHz ......................", cls: "boot__line--ok" },
  { text: "MEMORY: 64K BASE RAM .......................", cls: "boot__line--ok" },
  { text: "DISPLAY: AMBER PHOSPHOR P3 .................", cls: "boot__line--ok" },
  { text: "KEYBOARD: ASCII-MATRIX 83-KEY ..............", cls: "boot__line--ok" },
  { text: " ", cls: "boot__separator" },
  { text: "─────────────────────────────────────────────────────", cls: "boot__separator" },
  { text: "NETWORK SUBSYSTEM", cls: "boot__line" },
  { text: "─────────────────────────────────────────────────────", cls: "boot__separator" },
  { text: "ARPANET INTERFACE MODULE ...................", cls: "boot__line--ok" },
  { text: "TRANSPORT PROTOCOL: TCP/IP .................", cls: "boot__line--ok" },
  { text: "DNS RESOLVER CACHE: CLEARED ................", cls: "boot__line--ok" },
  { text: " ", cls: "boot__separator" },
  { text: "─────────────────────────────────────────────────────", cls: "boot__separator" },
  { text: "ATMOSPHERIC SUBSYSTEM", cls: "boot__line" },
  { text: "─────────────────────────────────────────────────────", cls: "boot__separator" },
  { text: "SENSOR ARRAY CALIBRATION ...................", cls: "boot__line--ok" },
  { text: "BAROMETRIC REFERENCE: 1013.25 HPA ..........", cls: "boot__line--ok" },
  { text: "TEMPERATURE UNIT: FAHRENHEIT ...............", cls: "boot__line--ok" },
  { text: "DATA PROVIDER: OPEN-METEO.COM ..............", cls: "boot__line--ok" },
  { text: " ", cls: "boot__separator" },
  { text: "─────────────────────────────────────────────────────", cls: "boot__separator" },
  { text: "SATELLITE UPLINK: ████████░░ 82% SIGNAL", cls: "boot__line" },
  { text: "─────────────────────────────────────────────────────", cls: "boot__separator" },
  { text: " ", cls: "boot__separator" },
  { text: "SYSTEM READY.", cls: "boot__line--bright" },
  { text: " ", cls: "boot__separator" },
];

const CHAR_DELAY_MS = 18;
const LINE_PAUSE_MS = 60;
const FINAL_PAUSE_MS = 900;

/**
 * Append a line element to the boot output container.
 */
function appendLine(container, text, cls) {
  const span = document.createElement("span");
  span.className = `boot__line ${cls}`;
  span.textContent = text;
  container.appendChild(span);
  container.scrollTop = container.scrollHeight;
  return span;
}

/**
 * Type text into an existing element, one character at a time.
 * Returns a Promise that resolves when typing is complete.
 */
function typeText(element, text, charDelay) {
  return new Promise((resolve) => {
    let i = 0;
    element.textContent = "";

    function next() {
      if (i >= text.length) {
        resolve();
        return;
      }
      element.textContent += text[i];
      i++;
      setTimeout(next, charDelay);
    }

    next();
  });
}

/**
 * Play the boot sequence animation.
 * If prefers-reduced-motion is active, renders all lines instantly.
 * Returns a Promise that resolves when animation is complete.
 */
export function playBootSequence() {
  const bootSection = document.getElementById("boot-section");
  const outputEl = document.getElementById("boot-output");
  const reduced = prefersReducedMotion();

  bootSection.removeAttribute("hidden");
  outputEl.innerHTML = "";

  return new Promise((resolve) => {
    if (reduced) {
      BOOT_LINES.forEach(({ text, cls }) => appendLine(outputEl, text, cls));
      setTimeout(resolve, 300);
      return;
    }

    let lineIndex = 0;

    async function renderNextLine() {
      if (lineIndex >= BOOT_LINES.length) {
        setTimeout(resolve, FINAL_PAUSE_MS);
        return;
      }

      const { text, cls } = BOOT_LINES[lineIndex];
      lineIndex++;

      const isDecorative = cls.includes("separator") || text.trim() === "";
      const willBeOk = cls === "boot__line--ok";
      const span = appendLine(outputEl, "", willBeOk ? "boot__line" : cls);

      if (isDecorative) {
        span.textContent = text;
      } else {
        await typeText(span, text, CHAR_DELAY_MS);
        if (willBeOk) span.classList.add("boot__line--ok");
      }

      setTimeout(renderNextLine, LINE_PAUSE_MS);
    }

    renderNextLine();
  });
}

/** Transition from boot section to main terminal interface. */
export function transitionToTerminal() {
  const boot = document.getElementById("boot-section");
  const terminal = document.getElementById("main-content");

  boot.setAttribute("hidden", "");
  terminal.removeAttribute("hidden");
  document.getElementById("location-input").focus();
}
