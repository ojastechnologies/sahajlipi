// Shared by the service worker, the popup and the bundled content script.

export const CONTENT_SCRIPT_ID = "sahajlipi-sites";
export const CONTENT_SCRIPT_FILE = "dist/content.js";

/** The storage key that holds the on/off choice for one site. */
export function siteKey(origin) {
  return `site:${origin}`;
}

/** Returns the origin of an http(s) URL, or null for pages extensions cannot script. */
export function siteOrigin(url) {
  try {
    const { protocol, origin } = new URL(url);
    return protocol === "https:" || protocol === "http:" ? origin : null;
  } catch {
    return null;
  }
}

/** The match pattern that grants host access to exactly one origin. */
export function originPattern(origin) {
  return `${origin}/*`;
}
