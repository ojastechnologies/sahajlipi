import { CONTENT_SCRIPT_FILE, CONTENT_SCRIPT_ID, siteKey, siteOrigin } from "./site.js";

// Sites the user granted get a persistent registration; everything else is
// injected once into the current tab through activeTab.
async function syncRegistration() {
  const { origins = [] } = await chrome.permissions.getAll();
  const existing = await chrome.scripting.getRegisteredContentScripts({ ids: [CONTENT_SCRIPT_ID] });
  if (!origins.length) {
    if (existing.length) await chrome.scripting.unregisterContentScripts({ ids: [CONTENT_SCRIPT_ID] });
    return;
  }
  const script = {
    id: CONTENT_SCRIPT_ID,
    js: [CONTENT_SCRIPT_FILE],
    matches: origins,
    allFrames: true,
    // Also reach about:blank frames, as executeScript does. Google Docs takes keys in one.
    matchOriginAsFallback: true,
    runAt: "document_idle",
  };
  const save = () => existing.length
    ? chrome.scripting.updateContentScripts([script])
    : chrome.scripting.registerContentScripts([script]);
  try {
    await save();
  } catch (error) {
    // Chrome 111 to 118 do not know the option; register without it there.
    if (!/matchOriginAsFallback/.test(error?.message)) throw error;
    delete script.matchOriginAsFallback;
    await save();
  }
}

async function inject(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    files: [CONTENT_SCRIPT_FILE],
  });
}

/** Resolves to { enabled } from the tab's top frame, or null when the script is not running there. */
async function tabStatus(tabId) {
  try {
    return await chrome.tabs.sendMessage(tabId, { type: "sahajlipi:status" }, { frameId: 0 }) ?? null;
  } catch {
    return null;
  }
}

async function setSite(tab, enabled) {
  const origin = siteOrigin(tab.url);
  if (!origin) return { ok: false, reason: "unsupported-page" };
  await chrome.storage.local.set({ [siteKey(origin)]: enabled });
  if (enabled && !await tabStatus(tab.id)) {
    try {
      await inject(tab.id);
    } catch (error) {
      return { ok: false, reason: String(error?.message ?? error) };
    }
  }
  return { ok: true };
}

// Per-tab, so the browser clears it when the tab navigates away.
async function showTabState(tabId, enabled) {
  await chrome.action.setBadgeBackgroundColor({ tabId, color: "#116B75" });
  await chrome.action.setBadgeTextColor({ tabId, color: "#F4F7FA" });
  await chrome.action.setBadgeText({ tabId, text: enabled ? "ने" : "" });
  await chrome.action.setTitle({ tabId, title: `SahajLipi: Nepali typing ${enabled ? "on" : "off"}` });
}

chrome.runtime.onInstalled.addListener(syncRegistration);
chrome.runtime.onStartup.addListener(syncRegistration);
chrome.permissions.onAdded.addListener(syncRegistration);
chrome.permissions.onRemoved.addListener(syncRegistration);

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command !== "toggle-nepali" || !tab?.id) return;
  const status = await tabStatus(tab.id);
  const enabled = status ? !status.enabled : true;
  const result = await setSite(tab, enabled);
  if (result.ok) {
    await chrome.tabs.sendMessage(tab.id, { type: "sahajlipi:announce", enabled }, { frameId: 0 }).catch(() => {});
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "sahajlipi:state" && sender.id === chrome.runtime.id && sender.tab && sender.frameId === 0) {
    showTabState(sender.tab.id, Boolean(message.enabled));
    return false;
  }
  // Only the extension's own pages (the popup) may drive these, not content scripts.
  if (sender.id !== chrome.runtime.id || !sender.url?.startsWith(chrome.runtime.getURL(""))) return false;
  if (message?.type === "sahajlipi:tab-status") {
    tabStatus(message.tabId).then(sendResponse);
    return true;
  }
  if (message?.type === "sahajlipi:set-site") {
    chrome.tabs.get(message.tabId)
      .then((tab) => setSite(tab, message.enabled))
      .then(sendResponse, (error) => sendResponse({ ok: false, reason: String(error) }));
    return true;
  }
  return false;
});
