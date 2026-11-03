// Colors follow docs/brand.md: light teal for hover, pale gold for the word now in the field.
const STYLE = `
  .menu {
    display: flex; flex-direction: column; min-width: 8rem; max-width: 20rem;
    padding: 4px; border: 1px solid #d5e0e7; border-radius: 8px;
    background: #fbfdfe; color: #192d3e; box-shadow: 0 6px 18px rgb(25 45 62 / 0.18);
    font: 17px/1.4 "Noto Sans Devanagari", "Kohinoor Devanagari", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    animation: enter 120ms cubic-bezier(0.25, 1, 0.5, 1);
  }
  button {
    all: unset; display: flex; gap: 1rem; align-items: center; justify-content: space-between;
    min-height: 32px; padding: 2px 8px; border-radius: 5px; cursor: pointer;
  }
  button[aria-selected="true"] { background: #fff6e2; }
  button:hover { background: #e8f6f5; }
  button:active { background: #d3ecea; }
  kbd { font: 600 11px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #44596a; }
  .live { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  @keyframes enter { from { opacity: 0; transform: translateY(-3px); } }
  @media (prefers-reduced-motion: reduce) { .menu { animation: none; } }
  @media (prefers-color-scheme: dark) {
    .menu { background: #1b2e3b; color: #eef5f8; border-color: #354a58; box-shadow: 0 6px 18px rgb(0 0 0 / 0.4); }
    button[aria-selected="true"] { background: rgb(229 173 62 / 0.16); }
    button:hover { background: #19353b; }
    button:active { background: #24484f; }
    kbd { color: #c0cdd6; }
  }
`;

const MIRRORED_STYLES = [
  "fontFamily", "fontSize", "fontStyle", "fontVariant", "fontWeight", "fontStretch", "letterSpacing",
  "lineHeight", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "tabSize", "textIndent",
  "textTransform", "wordSpacing", "direction",
];

// Option+digit reports "¡" and similar on macOS, so the label names the real key.
const altLabel = /Mac/.test(navigator.platform) ? "⌥" : "Alt+";

/**
 * A candidate list rendered next to the focused field. The adapter leaves
 * candidate UI to its host; this is the extension's. It lives in a closed
 * shadow root so page styles cannot reach it.
 */
export function createCandidateMenu(doc, { onChoose }) {
  const host = doc.createElement("sahajlipi-candidates");
  host.style.cssText = "all: initial; position: fixed; z-index: 2147483647; display: none;";
  const shadow = host.attachShadow({ mode: "closed" });
  const style = doc.createElement("style");
  style.textContent = STYLE;
  const menu = doc.createElement("div");
  menu.className = "menu";
  menu.setAttribute("role", "listbox");
  menu.setAttribute("aria-label", "Nepali spelling choices");
  const live = doc.createElement("div");
  live.className = "live";
  live.setAttribute("role", "status");
  shadow.append(style, menu, live);

  let field = null;
  let count = 0;

  function hide() {
    field = null;
    count = 0;
    live.textContent = "";
    host.style.display = "none";
  }

  // Text fields do not expose caret coordinates, so lay the text out in a hidden
  // copy inside the shadow root, where the page's observers and styles cannot see it.
  function caretPosition(target) {
    const computed = getComputedStyle(target);
    const multiline = target.tagName === "TEXTAREA";
    const mirror = doc.createElement("div");
    for (const name of MIRRORED_STYLES) mirror.style[name] = computed[name];
    const padding = parseFloat(computed.paddingLeft) + parseFloat(computed.paddingRight);
    Object.assign(mirror.style, {
      position: "absolute", top: "0", left: "0", visibility: "hidden", boxSizing: "content-box",
      width: `${target.clientWidth - padding}px`,
      whiteSpace: multiline ? "pre-wrap" : "pre",
      overflowWrap: multiline ? "break-word" : "normal",
    });
    mirror.textContent = target.value.slice(0, target.selectionEnd);
    const marker = doc.createElement("span");
    marker.textContent = "\u200b";
    mirror.append(marker);
    shadow.append(mirror);
    const position = {
      x: target.clientLeft + marker.offsetLeft - target.scrollLeft,
      top: target.clientTop + marker.offsetTop - target.scrollTop,
      bottom: target.clientTop + marker.offsetTop + marker.offsetHeight - target.scrollTop,
    };
    mirror.remove();
    return position;
  }

  function position() {
    if (!field) return;
    const rect = field.getBoundingClientRect();
    const caret = caretPosition(field);
    const clamp = (value, low, high) => Math.min(Math.max(value, low), high);
    // A one-line field keeps the list clear of its whole box; a text area follows the line.
    const multiline = field.tagName === "TEXTAREA";
    const lineTop = multiline ? clamp(rect.top + caret.top, rect.top, rect.bottom) : rect.top;
    const lineBottom = multiline ? clamp(rect.top + caret.bottom, rect.top, rect.bottom) : rect.bottom;
    const height = host.offsetHeight;
    const below = lineBottom + 4;
    const top = below + height > innerHeight && lineTop - height - 4 >= 0
      ? lineTop - height - 4
      : below;
    const left = clamp(rect.left + caret.x, rect.left, rect.right);
    host.style.left = `${Math.max(0, Math.min(left, innerWidth - host.offsetWidth))}px`;
    host.style.top = `${top}px`;
  }

  function render(candidates) {
    menu.replaceChildren(...candidates.map((candidate, index) => {
      const button = doc.createElement("button");
      button.type = "button";
      button.setAttribute("role", "option");
      // The adapter always shows the first reading until one is chosen.
      button.setAttribute("aria-selected", String(index === 0));
      const text = doc.createElement("span");
      text.textContent = candidate;
      button.append(text);
      if (index < 9) {
        const hint = doc.createElement("kbd");
        hint.textContent = `${altLabel}${index + 1}`;
        button.append(hint);
      }
      // Keep focus (and the adapter's active word) in the field while clicking.
      button.addEventListener("mousedown", (event) => event.preventDefault());
      button.addEventListener("click", () => {
        if (field) onChoose(field, index);
      });
      return button;
    }));
  }

  function update(changedField, state) {
    if (changedField !== doc.activeElement) {
      if (changedField === field) hide();
      return;
    }
    if (!state.enabled || state.candidates.length < 2) {
      hide();
      return;
    }
    field = changedField;
    count = state.candidates.length;
    if (!host.isConnected) doc.documentElement.append(host);
    render(state.candidates);
    live.textContent = `Spellings: ${state.candidates.join(", ")}`;
    host.style.display = "block";
    position();
  }

  // The adapter matches Alt+digit by event.key, which is not a digit when Option
  // composes a character on macOS. Match the physical key in that case only.
  doc.addEventListener("keydown", (event) => {
    if (!field || event.target !== field || !event.altKey || event.ctrlKey || event.metaKey) return;
    const digit = /^Digit([1-9])$/.exec(event.code)?.[1];
    if (!digit || /^[1-9]$/.test(event.key) || Number(digit) > count) return;
    event.preventDefault();
    onChoose(field, Number(digit) - 1);
  }, true);

  doc.addEventListener("focusout", (event) => {
    if (event.target === field) hide();
  }, true);
  addEventListener("scroll", position, { capture: true, passive: true });
  addEventListener("resize", position, { passive: true });

  return { update, hide };
}
