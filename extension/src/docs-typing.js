import { attachNepaliInput } from "sahajlipi/dom";

const GOOGLE_EDITORS_HOST = "docs.google.com";
const TYPING_FRAME_CLASS = "docs-texteventtarget-iframe";

/**
 * Which Google editor this frame belongs to: "document", "spreadsheets" or "other",
 * or null outside docs.google.com. The editors share one host but take typing in
 * different ways, so the extension treats each one on its own. An editor can be
 * embedded in another site, so this goes by the frame's own origin, which an
 * about:blank frame inherits from the page that made it.
 */
export function googleEditor(view = window) {
  let host;
  try {
    host = new URL(view.origin).hostname;
  } catch {
    return null;
  }
  if (host !== GOOGLE_EDITORS_HOST) return null;
  // A frame without an address of its own belongs to the nearest page that has one.
  let path = "";
  for (let current = view; ; current = current.parent) {
    try {
      if (current.location.protocol !== "about:") {
        path = current.location.pathname;
        break;
      }
    } catch {
      break;
    }
    if (current === current.parent) break;
  }
  if (path.includes("/document/")) return "document";
  if (path.includes("/spreadsheets/")) return "spreadsheets";
  return "other";
}

/**
 * The hidden frame Google Docs takes keystrokes in, seen from inside it, or null.
 * Docs draws the document on a canvas and empties the frame's editable box after
 * every key, so the box never holds the word being typed.
 */
export function docsTypingFrame(view = window) {
  try {
    const frame = view.frameElement;
    return frame?.classList.contains(TYPING_FRAME_CLASS) && googleEditor(view) === "document" ? frame : null;
  } catch {
    return null;
  }
}

// How many code points of the old text the replacement keeps, without splitting a pair.
function sharedStart(old, text) {
  let same = 0;
  while (same < text.length && same < old.length && text[same] === old[same]) same++;
  if (same > 0 && /[\uDC00-\uDFFF]/.test(old[same] ?? "")) same--;
  return same;
}

/**
 * Presents the text typed since the caret last moved through the shape the adapter
 * asks of a text box. Docs keeps no copy of it anywhere a script can read, so this
 * keeps one. A change is sent the way Docs accepts typing: Backspace once per code
 * point to remove, then a beforeinput insertText with the new ending.
 */
function createDocsField(box, doc) {
  const handlers = new Map();
  let value = "";

  const send = (type, init) => box.dispatchEvent(new KeyboardEvent(type, { bubbles: true, cancelable: true, ...init }));
  const backspace = () => {
    const init = { key: "Backspace", code: "Backspace", keyCode: 8, which: 8 };
    send("keydown", init);
    send("keyup", init);
  };
  const insert = (data) => box.dispatchEvent(new InputEvent("beforeinput", {
    inputType: "insertText", data, bubbles: true, cancelable: true,
  }));

  const field = {
    tagName: "INPUT",
    type: "text",
    ownerDocument: {
      get activeElement() { return doc.activeElement === box ? field : null; },
      // The caret is always at the end of this text; moving it resets the field.
      addEventListener() {},
      removeEventListener() {},
    },
    get value() { return value; },
    get selectionStart() { return value.length; },
    get selectionEnd() { return value.length; },
    setRangeText(text, start, end) {
      const replaced = value.slice(start);
      const kept = value.slice(end);
      const next = text + kept;
      const same = sharedStart(replaced, next);
      for (let i = [...replaced.slice(same)].length; i > 0; i--) backspace();
      if (next.length > same) insert(next.slice(same));
      value = value.slice(0, start) + next;
    },
    setSelectionRange() {},
    dispatchEvent: () => true,
    focus: () => box.focus(),
    addEventListener: (type, listener) => handlers.set(type, listener),
    removeEventListener: (type) => handlers.delete(type),
  };

  return {
    field,
    handlers,
    get value() { return value; },
    reset() { value = ""; },
  };
}

// Keys that leave the caret where it is.
const QUIET_KEYS = new Set(["Shift", "Control", "Alt", "AltGraph", "Meta", "CapsLock", "Fn", "Dead", "Process", "Unidentified"]);

/**
 * Nepali typing inside Google Docs' typing frame. It has the same shape as the
 * rich text fields, so content.js can use either. Undo, paste, Enter and the
 * caret keys stay with Docs; each of them ends the word in progress.
 */
export function createDocsTyping(doc, { frame, enabled: initialEnabled, onStateChange }) {
  const view = doc.defaultView;
  const topDoc = frame.ownerDocument;
  let enabled = initialEnabled;
  let box = null;
  let entry = null;
  let active = false;
  let candidates = 0;

  // Docs draws its caret in the page around this frame.
  const caretRect = () => {
    const caret = topDoc.querySelector(".kix-cursor-caret") ?? topDoc.querySelector(".kix-cursor");
    const rect = caret?.getBoundingClientRect();
    return rect && (rect.height || rect.width) ? rect : null;
  };

  function entryFor(element) {
    if (entry && box === element) return entry;
    entry?.controller.destroy();
    box = element;
    const created = createDocsField(element, doc);
    entry = { created, handlers: created.handlers };
    entry.controller = attachNepaliInput(created.field, {
      enabled,
      onStateChange: (state) => {
        active = Boolean(state.activeRoman);
        candidates = state.candidates.length;
        onStateChange(state, frame, caretRect);
      },
    });
    return entry;
  }

  function manages(element) {
    return Boolean(element?.isContentEditable) && element.closest("[contenteditable]") === element;
  }

  function focusedBox() {
    return enabled && manages(doc.activeElement) ? entryFor(doc.activeElement) : null;
  }

  // The adapter's word and this copy of the text end together.
  function reset() {
    if (!entry) return;
    entry.created.reset();
    entry.controller.setEnabled(enabled);
  }

  const take = (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
  };
  const synthetic = (inputType, data = null) => ({
    inputType, data, cancelable: true, isComposing: false, preventDefault() {},
  });

  // Events this code sends to Docs are not trusted, so they pass through untouched.
  function onKeyPress(event) {
    if (!event.isTrusted || event.isComposing || event.ctrlKey || event.metaKey) return;
    if ([...event.key].length !== 1) return;
    const typing = focusedBox();
    if (!typing) return;
    take(event);
    typing.handlers.get("beforeinput")(synthetic("insertText", event.key));
  }

  function onKeyDown(event) {
    if (!event.isTrusted || event.isComposing || QUIET_KEYS.has(event.key)) return;
    const typing = focusedBox();
    if (!typing) return;
    const modifier = event.ctrlKey || event.metaKey;
    // Option+digit composes a character on macOS, so match the physical key too.
    const digit = /^Digit([1-9])$/.exec(event.code)?.[1];
    if (event.altKey && !modifier && digit && Number(digit) <= candidates) {
      take(event);
      typing.controller.chooseCandidate(Number(digit) - 1);
      return;
    }
    // Shift may still be down from a capital letter, so it edits the word too.
    if (event.key === "Backspace" && !modifier && !event.altKey && active) {
      take(event);
      typing.handlers.get("beforeinput")(synthetic("deleteContentBackward"));
      return;
    }
    if (event.key === "Escape") {
      typing.handlers.get("keydown")(event);
      return;
    }
    // A printable key arrives as keypress next.
    if ([...event.key].length === 1 && !modifier) return;
    reset();
  }

  // A click on the candidate list keeps the word; any other click moves the caret.
  function onPointer(event) {
    if (event.composedPath()[0]?.localName === "sahajlipi-candidates") return;
    reset();
  }

  view.addEventListener("keypress", onKeyPress, true);
  view.addEventListener("keydown", onKeyDown, true);
  for (const type of ["paste", "cut", "drop", "compositionstart"]) view.addEventListener(type, reset, true);
  view.addEventListener("mousedown", onPointer, true);
  topDoc.addEventListener("mousedown", onPointer, true);
  doc.addEventListener("focusout", reset, true);

  return {
    manages,
    setEnabled(next) {
      enabled = Boolean(next);
      if (!entry) return;
      entry.created.reset();
      entry.controller.setEnabled(enabled);
    },
    getController(host) {
      if (host !== frame || !entry) return undefined;
      return { chooseCandidate: (index) => entry.controller.chooseCandidate(index) };
    },
  };
}
