import { originPattern, siteKey, siteOrigin } from "./site.js";

const siteLabel = document.querySelector("#site");
const toggle = document.querySelector("#toggle");
const note = document.querySelector("#note");
const forget = document.querySelector("#forget");

const send = (message) => chrome.runtime.sendMessage(message);

const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
const origin = tab?.url ? siteOrigin(tab.url) : null;

async function render() {
  const granted = await chrome.permissions.contains({ origins: [originPattern(origin)] });
  const status = await send({ type: "sahajlipi:tab-status", tabId: tab.id });
  const stored = (await chrome.storage.local.get(siteKey(origin)))[siteKey(origin)];
  toggle.checked = status ? status.enabled : granted && stored !== false;
  toggle.disabled = false;
  forget.hidden = !granted;
  note.textContent = granted
    ? "Remembered for this site."
    : status ? "On for this tab only. Allow the site to remember it." : "";
}

if (!origin) {
  siteLabel.textContent = "This page";
  note.textContent = "Browser and extension pages cannot be typed on.";
} else {
  siteLabel.textContent = origin;
  toggle.addEventListener("change", async () => {
    const enabled = toggle.checked;
    toggle.disabled = true;
    // Ask while the click still counts as a user gesture. A refusal still
    // leaves activeTab, which covers this tab until it navigates.
    if (enabled) await chrome.permissions.request({ origins: [originPattern(origin)] }).catch(() => false);
    const result = await send({ type: "sahajlipi:set-site", tabId: tab.id, enabled });
    await render();
    if (!result?.ok) note.textContent = `Could not run here: ${result?.reason ?? "unknown error"}`;
  });
  forget.addEventListener("click", async () => {
    await chrome.storage.local.remove(siteKey(origin));
    await chrome.permissions.remove({ origins: [originPattern(origin)] });
    await render();
  });
  await render();
}
