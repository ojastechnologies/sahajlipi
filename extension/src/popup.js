import { originPattern, siteKey, siteOrigin } from "./site.js";

const siteLabel = document.querySelector("#site");
const toggle = document.querySelector("#toggle");
const note = document.querySelector("#note");
const remember = document.querySelector("#remember");
const forget = document.querySelector("#forget");

const send = (message) => chrome.runtime.sendMessage(message);

const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
const origin = tab?.url ? siteOrigin(tab.url) : null;

async function render() {
  const granted = await chrome.permissions.contains({ origins: [originPattern(origin)] });
  const status = await send({ type: "sahajlipi:tab-status", tabId: tab.id });
  // Report what this tab is doing. An approved site can still have an open page
  // the script never reached; a click then has to turn it on, not off.
  toggle.checked = status?.enabled ?? false;
  toggle.disabled = false;
  remember.hidden = granted || !status?.enabled;
  forget.hidden = !granted;
  note.textContent = granted
    ? "Remembered for this site."
    : status?.enabled ? "On for this tab until it navigates." : "";
}

if (!origin) {
  siteLabel.textContent = "This page";
  note.textContent = "Browser and extension pages cannot be typed on.";
} else {
  siteLabel.textContent = origin;
  toggle.addEventListener("change", async () => {
    const enabled = toggle.checked;
    toggle.disabled = true;
    // The click grants activeTab for this tab, so no permission is needed here.
    const result = await send({ type: "sahajlipi:set-site", tabId: tab.id, enabled });
    await render();
    if (!result?.ok) note.textContent = `Could not run here: ${result?.reason ?? "unknown error"}`;
  });
  // Chrome's dialog can close this popup, so the service worker registers the
  // site from permissions.onAdded. A refusal leaves this tab as it is.
  remember.addEventListener("click", async () => {
    await chrome.permissions.request({ origins: [originPattern(origin)] }).catch(() => false);
    await render();
  });
  forget.addEventListener("click", async () => {
    await chrome.storage.local.remove(siteKey(origin));
    await chrome.permissions.remove({ origins: [originPattern(origin)] });
    await render();
  });
  await render();
}
