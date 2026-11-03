const STYLE = `
  .notice {
    display: flex; align-items: center; gap: 8px; padding: 6px 6px 6px 12px;
    border-radius: 8px; background: #192d3e; color: #f4f7fa;
    box-shadow: 0 6px 18px rgb(25 45 62 / 0.28);
    font: 500 13px/1.3 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    animation: enter 160ms cubic-bezier(0.25, 1, 0.5, 1);
  }
  .caret { flex: none; width: 3px; height: 15px; border-radius: 1px; background: #e5ad3e; }
  button {
    all: unset; flex: none; padding: 4px 8px; border-radius: 5px; color: #e5ad3e;
    font-weight: 600; cursor: pointer; white-space: nowrap;
  }
  button:hover { background: rgb(229 173 62 / 0.16); }
  button:active { background: rgb(229 173 62 / 0.28); }
  button:focus-visible { outline: 2px solid #e5ad3e; outline-offset: 1px; }
  @keyframes enter { from { opacity: 0; transform: translateY(-3px); } }
  @media (prefers-reduced-motion: reduce) { .notice { animation: none; } }
`;

const VISIBLE_MS = 6000;
const GAP = 6;
const EDGE = 8;

/**
 * True for a box the user can type in that the adapter cannot attach to: rich
 * text editors, and text fields inside shadow roots. Unattached fields elsewhere
 * were excluded on purpose (email, card numbers, ignored fields), so they stay quiet.
 */
export function isUnsupportedEditable(element, excludeSelector) {
  if (!element?.closest || element.closest(excludeSelector)) return false;
  if (element.isContentEditable) return true;
  const textField = element.tagName === "TEXTAREA" ||
    element.tagName === "INPUT" && (element.type === "text" || element.type === "search");
  return textField && !element.readOnly && !element.disabled &&
    element.getRootNode() !== element.ownerDocument;
}

/** Explains, next to the box, why typing there stays in Roman letters. */
export function createUnsupportedNotice(doc, { onDismiss }) {
  const host = doc.createElement("sahajlipi-notice");
  host.style.cssText = "all: initial; position: fixed; z-index: 2147483647; display: none;";
  const shadow = host.attachShadow({ mode: "closed" });
  const style = doc.createElement("style");
  style.textContent = STYLE;
  const notice = doc.createElement("div");
  notice.className = "notice";
  notice.setAttribute("role", "status");
  const caret = doc.createElement("span");
  caret.className = "caret";
  const label = doc.createElement("span");
  label.textContent = "SahajLipi can't type in this box yet.";
  const dismiss = doc.createElement("button");
  dismiss.type = "button";
  dismiss.textContent = "Don't show again";
  notice.append(caret, label, dismiss);
  shadow.append(style, notice);

  let target = null;
  let timer = null;

  function position() {
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const height = host.offsetHeight;
    const below = rect.bottom + GAP;
    // A box taller than the window keeps the notice on screen, at the bottom edge.
    const top = below + height <= innerHeight ? below
      : rect.top - height - GAP >= EDGE ? rect.top - height - GAP
      : innerHeight - height - EDGE;
    host.style.left = `${Math.max(EDGE, Math.min(rect.left, innerWidth - host.offsetWidth - EDGE))}px`;
    host.style.top = `${Math.max(EDGE, top)}px`;
  }

  function hide() {
    clearTimeout(timer);
    target = null;
    host.style.display = "none";
    removeEventListener("scroll", position, { capture: true });
    removeEventListener("resize", position);
  }

  // Keep focus in the box, so dismissing does not interrupt typing.
  dismiss.addEventListener("mousedown", (event) => event.preventDefault());
  dismiss.addEventListener("click", () => {
    hide();
    onDismiss();
  });
  doc.addEventListener("focusout", (event) => {
    if (target && event.composedPath()[0] === target) hide();
  }, true);

  function show(element) {
    target = element;
    if (!host.isConnected) doc.documentElement.append(host);
    host.style.display = "block";
    position();
    addEventListener("scroll", position, { capture: true, passive: true });
    addEventListener("resize", position, { passive: true });
    clearTimeout(timer);
    timer = setTimeout(hide, VISIBLE_MS);
  }

  return { show, hide };
}
