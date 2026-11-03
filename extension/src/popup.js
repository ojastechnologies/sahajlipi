import { originPattern, siteKey, siteOrigin } from "./site.js";

const siteLabel = document.querySelector("#site");
const toggle = document.querySelector("#toggle");
const note = document.querySelector("#note");
const remember = document.querySelector("#remember");
const forget = document.querySelector("#forget");
const shortcut = document.querySelector("#shortcut");
const shortcutKey = document.querySelector("#shortcut-key");

const send = (message) => chrome.runtime.sendMessage(message);

const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
const origin = tab?.url ? siteOrigin(tab.url) : null;

function say(text, { error = false } = {}) {
  note.textContent = text;
  note.classList.toggle("error", error);
}

function describe(granted, status) {
  if (status?.enabled) return granted ? "On whenever you visit this site." : "On until you leave or reload this page.";
  if (granted && status) return "Off on this site until you turn it back on.";
  return "Turn on to type Nepali on this page.";
}

async function render() {
  const granted = await chrome.permissions.contains({ origins: [originPattern(origin)] });
  const status = await send({ type: "sahajlipi:tab-status", tabId: tab.id });
  // Report what this tab is doing. An approved site can still have an open page
  // the script never reached; a click then has to turn it on, not off.
  toggle.checked = status?.enabled ?? false;
  toggle.disabled = false;
  remember.hidden = granted || !status?.enabled;
  forget.hidden = !granted;
  say(describe(granted, status));
}

// Shows the real binding: the user can rebind or clear it in the browser.
const commands = await chrome.commands.getAll();
const binding = commands.find((command) => command.name === "toggle-nepali")?.shortcut;
if (binding && origin) {
  shortcutKey.textContent = binding;
  shortcut.hidden = false;
}

if (!origin) {
  document.body.dataset.state = "unavailable";
  siteLabel.textContent = "This page";
  say("Browsers don't allow extensions on this page. Open a website to use SahajLipi.");
} else {
  siteLabel.textContent = new URL(origin).host;
  siteLabel.title = origin;
  toggle.addEventListener("change", async () => {
    const enabled = toggle.checked;
    toggle.disabled = true;
    // The click grants activeTab for this tab, so no permission is needed here.
    const result = await send({ type: "sahajlipi:set-site", tabId: tab.id, enabled });
    await render();
    if (!result?.ok) {
      console.warn("SahajLipi could not run on this page:", result?.reason);
      say("This page doesn't allow extensions, so Nepali typing can't start here.", { error: true });
    }
  });
  // Chrome's dialog can close this popup, so the service worker registers the
  // site from permissions.onAdded. A refusal leaves this tab as it is.
  remember.addEventListener("click", async () => {
    const granted = await chrome.permissions.request({ origins: [originPattern(origin)] }).catch(() => false);
    await render();
    if (!granted) say("Not remembered. Still on until you leave or reload this page.");
  });
  forget.addEventListener("click", async () => {
    await chrome.storage.local.remove(siteKey(origin));
    await chrome.permissions.remove({ origins: [originPattern(origin)] });
    await render();
  });
  await render();
}
