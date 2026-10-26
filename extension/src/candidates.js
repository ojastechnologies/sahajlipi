const STYLE = `
  .menu {
    display: flex; flex-direction: column; min-width: 8rem; max-width: 20rem;
    padding: 4px; border: 1px solid #c9ced6; border-radius: 6px;
    background: #fff; color: #1d2430; box-shadow: 0 4px 14px rgb(0 0 0 / 0.16);
    font: 16px/1.4 "Noto Sans Devanagari", "Kohinoor Devanagari", system-ui, sans-serif;
  }
  button {
    all: unset; display: flex; gap: 0.75rem; justify-content: space-between;
    padding: 3px 8px; border-radius: 4px; cursor: pointer;
  }
  button:hover, button:focus-visible { background: #e8eefb; }
  kbd { font: 11px/1.9 system-ui, sans-serif; color: #5b6472; }
  @media (prefers-color-scheme: dark) {
    .menu { background: #20252d; color: #eef1f5; border-color: #3a414c; }
    button:hover, button:focus-visible { background: #2f3a4d; }
    kbd { color: #a3acb9; }
  }
`;

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
  shadow.append(style, menu);

  let field = null;

  function hide() {
    field = null;
    host.style.display = "none";
  }

  function position() {
    if (!field) return;
    const rect = field.getBoundingClientRect();
    const height = host.offsetHeight;
    const below = rect.bottom + 4;
    const top = below + height > innerHeight && rect.top - height - 4 >= 0
      ? rect.top - height - 4
      : below;
    host.style.left = `${Math.max(0, Math.min(rect.left, innerWidth - host.offsetWidth))}px`;
    host.style.top = `${top}px`;
  }

  function render(candidates) {
    menu.replaceChildren(...candidates.map((candidate, index) => {
      const button = doc.createElement("button");
      button.type = "button";
      button.setAttribute("role", "option");
      const text = doc.createElement("span");
      text.textContent = candidate;
      button.append(text);
      if (index < 9) {
        const hint = doc.createElement("kbd");
        hint.textContent = `Alt+${index + 1}`;
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
    if (!host.isConnected) doc.documentElement.append(host);
    render(state.candidates);
    host.style.display = "block";
    position();
  }

  doc.addEventListener("focusout", (event) => {
    if (event.target === field) hide();
  }, true);
  addEventListener("scroll", position, { capture: true, passive: true });
  addEventListener("resize", position, { passive: true });

  return { update, hide };
}
