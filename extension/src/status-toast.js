const STYLE = `
  .toast {
    display: flex; align-items: center; gap: 8px; padding: 8px 12px;
    border-radius: 8px; background: #192d3e; color: #f4f7fa;
    box-shadow: 0 6px 18px rgb(25 45 62 / 0.28);
    font: 600 13px/1.3 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    animation: enter 160ms cubic-bezier(0.25, 1, 0.5, 1);
  }
  .caret { width: 3px; height: 15px; border-radius: 1px; background: #e5ad3e; }
  .off .caret { background: #8ba0ae; }
  @keyframes enter { from { opacity: 0; transform: translateY(-4px); } }
  @media (prefers-reduced-motion: reduce) { .toast { animation: none; } }
`;

const VISIBLE_MS = 1600;

/** A brief on-page confirmation for the keyboard shortcut, which has no other visible result when the toolbar icon is unpinned. */
export function createStatusToast(doc) {
  const host = doc.createElement("sahajlipi-toast");
  host.style.cssText = "all: initial; position: fixed; top: 12px; right: 12px; z-index: 2147483647; display: none; pointer-events: none;";
  const shadow = host.attachShadow({ mode: "closed" });
  const style = doc.createElement("style");
  style.textContent = STYLE;
  const toast = doc.createElement("div");
  toast.setAttribute("role", "status");
  shadow.append(style, toast);
  let timer = null;

  return function show(enabled) {
    clearTimeout(timer);
    const caret = doc.createElement("span");
    caret.className = "caret";
    const label = doc.createElement("span");
    label.textContent = enabled ? "Nepali typing on" : "Nepali typing off";
    toast.className = enabled ? "toast" : "toast off";
    toast.replaceChildren(caret, label);
    if (!host.isConnected) doc.documentElement.append(host);
    host.style.display = "block";
    timer = setTimeout(() => { host.style.display = "none"; }, VISIBLE_MS);
  };
}
