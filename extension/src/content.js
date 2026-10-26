import { attachNepaliInputs } from "sahajlipi/dom";
import { createCandidateMenu } from "./candidates.js";
import { siteKey } from "./site.js";

// The registered script and an activeTab injection share this isolated world;
// the flag keeps a second injection from attaching the same fields again.
const INSTANCE = Symbol.for("sahajlipi.extension");

// scope: "all" already skips email, password, number and tel inputs. Plain text
// inputs can still hold card numbers, codes or usernames, where converted digits
// or letters would corrupt the value; those fields announce themselves through
// inputmode and autocomplete. Fields the page marks for its own SahajLipi are
// skipped too: two adapters on one field both convert every keystroke.
const EXCLUDE_SELECTOR = [
  "[data-sahajlipi-ignore]",
  "[data-sahajlipi]",
  ...["numeric", "decimal", "tel", "email", "url"].map((mode) => `[inputmode="${mode}" i]`),
  ...["cc-number", "cc-csc", "cc-exp", "cc-exp-month", "cc-exp-year", "one-time-code",
    "tel", "email", "username", "url", "postal-code"].map((token) => `[autocomplete~="${token}" i]`),
].join(", ");

// The toolbar choice belongs to the tab's site, so embedded frames follow it.
function topOrigin() {
  const ancestors = location.ancestorOrigins;
  return ancestors?.length ? ancestors[ancestors.length - 1] : location.origin;
}

async function start() {
  const key = siteKey(topOrigin());
  const stored = await chrome.storage.local.get(key);
  let manager = null;
  const menu = createCandidateMenu(document, {
    onChoose(field, index) {
      manager?.getController(field)?.chooseCandidate(index);
    },
  });
  try {
    manager = attachNepaliInputs(document, {
      scope: "all",
      excludeSelector: EXCLUDE_SELECTOR,
      enabled: stored[key] ?? true,
      onStateChange: (state, field) => menu.update(field, state),
    });
  } catch (error) {
    console.warn("SahajLipi could not attach to this page:", error);
    return null;
  }
  // A missing choice means "on" for a fresh injection, but forgetting a site
  // while its tabs are open should switch them off rather than on.
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && key in changes) manager.setEnabled(changes[key].newValue ?? false);
  });
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "sahajlipi:status") sendResponse({ enabled: manager.getEnabled() });
  });
  return manager;
}

if (!globalThis[INSTANCE]) globalThis[INSTANCE] = start();
