import { attachNepaliInput } from "sahajlipi/dom";

// Google Docs types into a hidden editable box and draws on a canvas, so a
// replacement there would not land in the document. See the design note.
const UNSUPPORTED_HOSTS = new Set(["docs.google.com"]);

const RENDER_WAIT_MS = 50;

const isInline = (element) => /^(inline|contents|ruby)/.test(getComputedStyle(element).display);

function blockOf(node, host) {
  let element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  while (element && element !== host && isInline(element)) element = element.parentElement;
  return element && host.contains(element) ? element : host;
}

// The text of one block as the adapter should see it. A line in a rich editor is
// the adapter's whole "field": a word never spans blocks. A node holding only an
// editor's zero-width placeholder counts as empty, or it would look like text
// that disappears when the first letter arrives.
function readBlock(block) {
  const parts = [];
  let value = "";
  const walker = block.ownerDocument.createTreeWalker(block, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode(node) {
      if (node.nodeType === Node.TEXT_NODE) return NodeFilter.FILTER_ACCEPT;
      if (node.tagName === "BR") return NodeFilter.FILTER_ACCEPT;
      return isInline(node) ? NodeFilter.FILTER_SKIP : NodeFilter.FILTER_REJECT;
    },
  });
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const text = node.nodeType === Node.TEXT_NODE ? node.data : "\n";
    if (/^[﻿​]*$/.test(text)) continue;
    parts.push({ node, start: value.length, length: text.length });
    value += text;
  }
  // A closing <br> only gives an empty or last line its height.
  if (parts.at(-1)?.node.nodeType === Node.ELEMENT_NODE) {
    parts.pop();
    value = value.slice(0, -1);
  }
  return { parts, value };
}

function offsetIn({ parts, value }, container, offset) {
  const probe = container.ownerDocument.createRange();
  probe.setStart(container, offset);
  probe.collapse(true);
  for (const part of parts) {
    if (part.node === container) return part.start + Math.min(offset, part.length);
    if (probe.comparePoint(part.node, 0) >= 0) return part.start;
  }
  return value.length;
}

function pointAt({ parts }, block, offset) {
  for (const part of parts) {
    if (offset > part.start + part.length) continue;
    if (part.node.nodeType === Node.TEXT_NODE) return [part.node, offset - part.start];
    return [part.node.parentNode, [...part.node.parentNode.childNodes].indexOf(part.node) + (offset - part.start)];
  }
  return [block, block.childNodes.length];
}

// Browsers write a trailing space as U+00A0 and swap it back when text follows, so
// that difference is not an outside edit.
const sameText = (a, b) => a.replaceAll("\u00A0", " ") === b.replaceAll("\u00A0", " ");

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

// How much of the replacement already stands in the document, so the editor only
// reflows what changed. It stops at a grapheme edge: the browser widens a selection
// that starts inside a cluster such as ना, and the edit would land in the wrong place.
function sharedStart(value, start, end, text) {
  const old = value.slice(start, end);
  let same = 0;
  while (same < text.length && same < old.length && text[same] === old[same]) same++;
  if (same === old.length) return same;
  let edge = 0;
  for (const { index } of segmenter.segment(old)) {
    if (index > same) break;
    edge = index;
  }
  return edge;
}

// Chromium fires no beforeinput for an edit command, so an editor that takes its
// edits from beforeinput (Slate) would never hear of one. The event carries the
// range being replaced, as a real one does; true means the editor made the edit.
function offerBeforeInput(host, doc, inputType, data = null) {
  const range = doc.getSelection().getRangeAt(0);
  return !host.dispatchEvent(new InputEvent("beforeinput", {
    inputType, data, bubbles: true, cancelable: true, composed: true,
    targetRanges: [new StaticRange({
      startContainer: range.startContainer, startOffset: range.startOffset,
      endContainer: range.endContainer, endOffset: range.endOffset,
    })],
  }));
}

// A key press reaches an editor as textInput, then beforeinput, then the edit, and
// any of them can take it over. Draft.js reads textInput and either renders the text
// itself or leaves the edit to the browser; without the event it re-renders an empty
// line over the browser's change and throws. A synthetic event has no edit behind
// it, so whichever step nobody cancels ends in the edit command.
function insertTyped(host, doc, text) {
  const event = doc.createEvent("TextEvent");
  event.initTextEvent("textInput", true, true, doc.defaultView, text);
  if (!host.dispatchEvent(event) || offerBeforeInput(host, doc, "insertText", text)) return;
  doc.execCommand("insertText", false, text);
}

// Editors bind Backspace on keydown; the rest follow the same steps as typing.
function deleteSelected(host, doc) {
  const handled = !host.dispatchEvent(new KeyboardEvent("keydown", {
    key: "Backspace", code: "Backspace", keyCode: 8, which: 8, bubbles: true, cancelable: true,
  }));
  if (handled || offerBeforeInput(host, doc, "deleteContentBackward")) return;
  doc.execCommand("delete");
}

/**
 * Presents one line of a rich editor through the shape the adapter asks of a text
 * box, so the same engine, Roman word tracking, candidates and Backspace behaviour
 * apply. Writes go through the browser's typing path: the editor sees them as
 * typing and updates its own document, which direct DOM changes would not do.
 */
function createField(host, doc) {
  const selection = () => doc.getSelection();
  const handlers = new Map();
  let block = host;
  let pending = null;
  let known = "";
  let selectionListener = null;

  const liveBlock = () => {
    const range = selection().rangeCount ? selection().getRangeAt(0) : null;
    return range && host.contains(range.startContainer) ? blockOf(range.startContainer, host) : block;
  };
  const offsets = () => {
    const current = liveBlock();
    const read = readBlock(current);
    const range = selection().rangeCount ? selection().getRangeAt(0) : null;
    if (!range || !current.contains(range.startContainer)) return [read.value.length, read.value.length];
    return [
      offsetIn(read, range.startContainer, range.startOffset),
      current.contains(range.endContainer) ? offsetIn(read, range.endContainer, range.endOffset) : read.value.length,
    ];
  };

  const field = {
    tagName: "INPUT",
    type: "text",
    ownerDocument: {
      get activeElement() { return doc.activeElement === host ? field : null; },
      // The adapter ends a word when the caret leaves it, but an editor that renders
      // after the event still shows the old caret, so wait until its text catches up.
      addEventListener(type, listener) {
        selectionListener = () => {
          if (!pending && sameText(readBlock(liveBlock()).value, known)) listener();
        };
        doc.addEventListener(type, selectionListener);
      },
      removeEventListener: (type) => doc.removeEventListener(type, selectionListener),
    },
    get value() { return pending ? pending.value : readBlock(liveBlock()).value; },
    get selectionStart() { return pending ? pending.start : offsets()[0]; },
    get selectionEnd() { return pending ? pending.end : offsets()[1]; },
    setRangeText(text, start, end) {
      const { value } = pending;
      const same = sharedStart(value, start, end, text);
      const read = readBlock(block);
      const from = pointAt(read, block, start + same);
      const to = pointAt(read, block, end);
      selection().setBaseAndExtent(from[0], from[1], to[0], to[1]);
      // Editors learn of a selection asynchronously; the edit below needs it now.
      doc.dispatchEvent(new Event("selectionchange"));
      const inserted = text.slice(same);
      if (inserted) insertTyped(host, doc, inserted);
      else if (start + same < end) deleteSelected(host, doc);
      pending.value = value.slice(0, start) + text + value.slice(end);
      pending.start = pending.end = start + text.length;
    },
    setSelectionRange(start, end) {
      pending.start = start;
      pending.end = end;
    },
    dispatchEvent: () => true,
    focus: () => host.focus(),
    addEventListener: (type, listener) => handlers.set(type, listener),
    removeEventListener: (type) => handlers.delete(type),
  };

  return {
    field,
    handlers,
    get block() { return block; },
    set block(next) { block = next; },
    get pending() { return pending; },
    begin() {
      const [start, end] = offsets();
      pending = { value: readBlock(block).value, start, end };
    },
    get known() { return known; },
    set known(next) { known = next; },
    end() { known = pending.value; pending = null; },
  };
}

/**
 * Nepali typing in contenteditable editors. The editor must never see the Roman
 * letter, so keys are taken at the window before any page listener runs.
 */
export function createRichTextFields(doc, { excludeSelector, enabled: initialEnabled, onStateChange }) {
  const view = doc.defaultView;
  const entries = new Map();
  let enabled = initialEnabled;
  let busy = false;
  let queued = null;

  function entryFor(host) {
    let entry = entries.get(host);
    if (entry) return entry;
    for (const known of entries.keys()) if (!known.isConnected) entries.delete(known);
    const created = createField(host, doc);
    entry = { ...created, created };
    entry.controller = attachNepaliInput(created.field, {
      enabled,
      onStateChange: (state) => onStateChange(state, host, () => caretRect(doc)),
    });
    entries.set(host, entry);
    return entry;
  }

  function focusedHost() {
    if (UNSUPPORTED_HOSTS.has(location.hostname)) return null;
    const active = doc.activeElement;
    if (!active?.isContentEditable || active.closest(excludeSelector)) return null;
    return active.closest("[contenteditable]") === active ? active : null;
  }

  // Line up the adapter with the editor before each edit. Anything the adapter did
  // not write (undo, paste, a click on another line) ends the word in progress.
  function prepare(host, { allowRange = true } = {}) {
    const selection = doc.getSelection();
    if (!selection?.rangeCount) return null;
    const range = selection.getRangeAt(0);
    if (!host.contains(range.startContainer) || !host.contains(range.endContainer)) return null;
    const block = blockOf(range.startContainer, host);
    if (!block.contains(range.endContainer) || (!allowRange && !range.collapsed)) return null;
    const entry = entryFor(host);
    const value = readBlock(block).value;
    // An empty editor can hold the caret on its root until the first letter makes
    // a line, so a block inside the old one (or around it) is still the same place.
    const old = entry.created.block;
    const moved = old.isConnected && !old.contains(block) && !block.contains(old);
    const changed = !sameText(value, entry.created.known);
    entry.created.block = block;
    entry.created.known = value;
    if (moved || changed) entry.controller.setEnabled(enabled);
    return entry;
  }

  // A selection across lines (Select All, say) has no place in one line's text.
  // Typing replaces it, so clear it the way the editor would and type at the caret.
  function clearWideSelection(host) {
    const range = doc.getSelection()?.rangeCount ? doc.getSelection().getRangeAt(0) : null;
    if (!range || range.collapsed || !host.contains(range.startContainer)) return false;
    const { value } = readBlock(blockOf(range.startContainer, host));
    if (!range.toString() || value.includes(range.toString())) return false;
    deleteSelected(host, doc);
    return true;
  }

  function run(entry, action) {
    busy = true;
    entry.created.begin();
    try {
      action();
    } finally {
      entry.created.end();
      busy = false;
    }
  }

  const take = (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
  };
  const synthetic = (inputType, data) => ({
    inputType, data, cancelable: true, isComposing: false, preventDefault() {},
  });

  function typeAtCaret(host, data) {
    const entry = prepare(host);
    if (!entry) return;
    run(entry, () => entry.created.handlers.get("beforeinput")(synthetic("insertText", data)));
  }

  function typeInto(event, data) {
    const host = focusedHost();
    if (!host) return;
    take(event);
    if (queued) {
      queued.push(data);
    } else if (clearWideSelection(host)) {
      // Some editors render the deletion after this event, and a letter typed
      // before then would be lost when they do.
      queued = [data];
      const drain = () => {
        typeAtCaret(host, queued.shift());
        if (queued.length) setTimeout(drain, RENDER_WAIT_MS);
        else queued = null;
      };
      setTimeout(drain, RENDER_WAIT_MS);
    } else {
      typeAtCaret(host, data);
    }
  }

  function onKeyPress(event) {
    if (!enabled || busy || event.isComposing || event.ctrlKey || event.metaKey) return;
    if ([...event.key].length === 1) typeInto(event, event.key);
  }

  // Keyboards reach the page through keypress; this covers what arrives without
  // one, such as an emoji picker.
  function onBeforeInput(event) {
    if (!enabled || busy || event.isComposing || !event.cancelable) return;
    if (event.inputType === "insertText" && typeof event.data === "string") typeInto(event, event.data);
  }

  function onKeyDown(event) {
    if (!enabled || busy || event.isComposing) return;
    const host = focusedHost();
    if (!host) return;
    const modifier = event.metaKey || event.ctrlKey;
    if (event.key === "Backspace" || event.key === "Delete") {
      // Some editors act on the keydown itself, so waiting for beforeinput is too late.
      if (modifier || event.altKey || event.shiftKey) return;
      const entry = prepare(host, { allowRange: false });
      if (!entry) return;
      const [start, length] = [entry.field.selectionStart, entry.field.value.length];
      // At a line's edge the editor merges lines; a range can cross formatting.
      if (event.key === "Backspace" ? start === 0 : start === length) return;
      take(event);
      const kind = event.key === "Backspace" ? "deleteContentBackward" : "deleteContentForward";
      run(entry, () => entry.created.handlers.get("beforeinput")(synthetic(kind)));
      return;
    }
    // Undo stays with the editor, whose history holds every edit made here.
    if (modifier) return;
    const entry = prepare(host);
    if (!entry) return;
    run(entry, () => entry.created.handlers.get("keydown")(event));
    if (event.defaultPrevented) event.stopImmediatePropagation();
  }

  view.addEventListener("keypress", onKeyPress, true);
  view.addEventListener("beforeinput", onBeforeInput, true);
  view.addEventListener("keydown", onKeyDown, true);

  return {
    setEnabled(next) {
      enabled = Boolean(next);
      for (const entry of entries.values()) entry.controller.setEnabled(enabled);
    },
    getController(host) {
      const entry = entries.get(host);
      if (!entry) return undefined;
      return {
        chooseCandidate(index) {
          const prepared = prepare(host);
          if (prepared) run(prepared, () => prepared.controller.chooseCandidate(index));
        },
      };
    },
  };
}

function caretRect(doc) {
  const selection = doc.getSelection();
  if (!selection?.rangeCount) return null;
  const rect = selection.getRangeAt(0).getBoundingClientRect();
  return rect.height ? rect : null;
}
