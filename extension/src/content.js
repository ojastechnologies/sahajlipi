import { attachNepaliInputs } from "sahajlipi/dom";
import { createCandidateMenu } from "./candidates.js";
import { createDocsTyping, docsTypingFrame } from "./docs-typing.js";
import { createRichTextFields } from "./rich-text.js";
import { noticeKey, siteKey } from "./site.js";
import { createStatusToast } from "./status-toast.js";
import { createUnsupportedNotice, isUnsupportedEditable } from "./unsupported-notice.js";

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
  const dismissKey = noticeKey(topOrigin());
  const stored = await chrome.storage.local.get([key, dismissKey]);
  let manager = null;
  let rich = null;
  // Google Docs takes keys in a hidden frame, so its candidate list goes in the page around it.
  const docsFrame = docsTypingFrame();
  const menu = createCandidateMenu(docsFrame?.ownerDocument ?? document, {
    onChoose(field, index) {
      (manager?.getController(field) ?? rich?.getController(field))?.chooseCandidate(index);
    },
  });
  try {
    const enabled = stored[key] ?? true;
    manager = attachNepaliInputs(document, {
      scope: "all",
      excludeSelector: EXCLUDE_SELECTOR,
      enabled,
      onStateChange: (state, field) => menu.update(field, state),
    });
    const onRichState = (state, field, anchor) => menu.update(field, state, anchor);
    rich = docsFrame
      ? createDocsTyping(document, { frame: docsFrame, enabled, onStateChange: onRichState })
      : createRichTextFields(document, { excludeSelector: EXCLUDE_SELECTOR, enabled, onStateChange: onRichState });
  } catch (error) {
    console.warn("SahajLipi could not attach to this page:", error);
    return null;
  }
  // Typing a letter into a box the adapter cannot reach would otherwise just stay
  // in Roman, which looks broken. Say why, once per page, at the moment it matters.
  let noticeDone = Boolean(stored[dismissKey]);
  const notice = createUnsupportedNotice(document, {
    onDismiss: () => chrome.storage.local.set({ [dismissKey]: true }),
  });
  document.addEventListener("beforeinput", (event) => {
    if (noticeDone || !manager.getEnabled()) return;
    if (!event.isTrusted || event.isComposing || event.inputType !== "insertText") return;
    if (!/[a-z]/i.test(event.data ?? "")) return;
    const element = event.composedPath()[0];
    if (manager.getController(element) || rich.manages(element)) return;
    if (!isUnsupportedEditable(element, EXCLUDE_SELECTOR)) return;
    noticeDone = true;
    notice.show(element);
  }, true);
  // The toolbar badge follows the tab, so only its top frame reports.
  const reportState = () => {
    if (window !== window.top) return;
    chrome.runtime.sendMessage({ type: "sahajlipi:state", enabled: manager.getEnabled() }).catch(() => {});
  };
  reportState();
  // A missing choice means "on" for a fresh injection, but forgetting a site
  // while its tabs are open should switch them off rather than on.
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !(key in changes)) return;
    manager.setEnabled(changes[key].newValue ?? false);
    rich.setEnabled(changes[key].newValue ?? false);
    if (!manager.getEnabled()) notice.hide();
    reportState();
  });
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "sahajlipi:status") sendResponse({ enabled: manager.getEnabled() });
  });
  return manager;
}

if (!globalThis[INSTANCE]) {
  // Registered before start() awaits storage: the shortcut's announcement can
  // arrive right after a first injection.
  const showStatus = createStatusToast(document);
  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "sahajlipi:announce") showStatus(message.enabled);
  });
  globalThis[INSTANCE] = start();
}
