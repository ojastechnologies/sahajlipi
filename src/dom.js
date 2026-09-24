import { convertText as defaultConvertText, convertWord as defaultConvertWord } from "./index.js";

function isSupportedField(input) {
  if (!input || typeof input.value !== "string" ||
      typeof input.setRangeText !== "function" ||
      typeof input.setSelectionRange !== "function") return false;
  const tagName = input.tagName?.toUpperCase();
  return tagName === "TEXTAREA" ||
    tagName === "INPUT" && (input.type === "text" || input.type === "search");
}

/**
 * Attach inline Roman Nepali conversion to one textarea or text/search input.
 *
 * The adapter keeps the Roman spelling of the word at the caret. This lets
 * Backspace edit that spelling even when its Nepali rendering has a different
 * number of characters. Pass an engine's conversion functions to customize
 * the mapping; the built-in Nepali engine is used by default.
 */
export function attachNepaliInput(input, {
  convertWord = defaultConvertWord,
  convertText = defaultConvertText,
  onStateChange = () => {},
} = {}) {
  if (!isSupportedField(input)) {
    throw new TypeError("attachNepaliInput expects a textarea or text/search input");
  }
  if (typeof convertWord !== "function" || typeof convertText !== "function") {
    throw new TypeError("convertWord and convertText must be functions");
  }
  if (typeof onStateChange !== "function") {
    throw new TypeError("onStateChange must be a function");
  }
  const ownerDocument = input.ownerDocument ?? globalThis.document;
  if (!ownerDocument || typeof ownerDocument.addEventListener !== "function") {
    throw new TypeError("attachNepaliInput expects a field with an owner document");
  }

  const segmenter = typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;
  const undoStack = [];
  const redoStack = [];
  let enabled = true;
  let active = null;
  let composing = false;
  let compositionBefore = null;
  let compositionTimer = null;
  let mutating = false;
  let destroyed = false;

  const snapshot = () => ({
    value: input.value,
    start: input.selectionStart,
    end: input.selectionEnd,
    active: active ? { ...active, candidates: [...active.candidates] } : null,
  });
  let lastSnapshot = snapshot();

  function state() {
    return {
      text: input.value,
      enabled,
      activeRoman: active?.roman ?? "",
      candidates: active && active.ambiguous && !active.dismissed
        ? [...active.candidates]
        : [],
    };
  }

  function emit() {
    if (!destroyed) onStateChange(state());
  }

  function remember(before) {
    const sameActive = before.active === null && active === null ||
      before.active !== null && active !== null &&
      before.active.start === active.start &&
      before.active.end === active.end &&
      before.active.roman === active.roman &&
      before.active.ambiguous === active.ambiguous &&
      before.active.dismissed === active.dismissed &&
      before.active.candidates.length === active.candidates.length &&
      before.active.candidates.every((candidate, index) => candidate === active.candidates[index]);
    if (before.value === input.value &&
        before.start === input.selectionStart &&
        before.end === input.selectionEnd && sameActive) {
      lastSnapshot = snapshot();
      emit();
      return;
    }
    undoStack.push(before);
    if (undoStack.length > 200) undoStack.shift();
    redoStack.length = 0;
    lastSnapshot = snapshot();
    emit();
  }

  function replace(start, end, text, nextActive = null) {
    const before = snapshot();
    mutating = true;
    input.setRangeText(text, start, end, "end");
    active = nextActive;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    mutating = false;
    remember(before);
  }

  function renderWord(roman) {
    try {
      const result = convertWord(roman);
      const text = typeof result?.text === "string" ? result.text : roman;
      const candidates = Array.isArray(result?.candidates)
        ? [...new Set(result.candidates.filter((item) => typeof item === "string" && item.length))]
        : [text];
      if (!candidates.includes(text)) candidates.unshift(text);
      return {
        text,
        candidates,
        ambiguous: Boolean(result?.ambiguous && candidates.length > 1),
      };
    } catch {
      return { text: roman, candidates: [roman], ambiguous: false };
    }
  }

  function insertRoman(letters) {
    const continuing = active &&
      input.selectionStart === active.end &&
      input.selectionEnd === active.end;
    const start = continuing ? active.start : input.selectionStart;
    const end = continuing ? active.end : input.selectionEnd;
    const roman = (continuing ? active.roman : "") + letters;
    const result = renderWord(roman);
    replace(start, end, result.text, {
      start,
      end: start + result.text.length,
      roman,
      candidates: result.candidates,
      ambiguous: result.ambiguous,
      dismissed: false,
    });
  }

  function convertTyped(text) {
    try { return convertText(text); } catch { return text; }
  }

  function previousGraphemeStart(caret) {
    const prefix = input.value.slice(0, caret);
    if (!prefix) return caret;
    if (segmenter) {
      let previous = 0;
      for (const part of segmenter.segment(prefix)) previous = part.index;
      return previous;
    }
    return caret - Array.from(prefix).at(-1).length;
  }

  function nextGraphemeEnd(caret) {
    const suffix = input.value.slice(caret);
    if (!suffix) return caret;
    if (segmenter) return caret + segmenter.segment(suffix)[Symbol.iterator]().next().value.segment.length;
    return caret + Array.from(suffix)[0].length;
  }

  function deleteBackward() {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    if (start !== end) {
      replace(start, end, "");
    } else if (active && end === active.end) {
      const roman = active.roman.slice(0, -1);
      if (!roman) {
        replace(active.start, active.end, "");
      } else {
        const result = renderWord(roman);
        replace(active.start, active.end, result.text, {
          start: active.start,
          end: active.start + result.text.length,
          roman,
          candidates: result.candidates,
          ambiguous: result.ambiguous,
          dismissed: false,
        });
      }
    } else if (start > 0) {
      replace(previousGraphemeStart(start), start, "");
    }
  }

  function deleteForward() {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    if (start !== end) replace(start, end, "");
    else if (end < input.value.length) replace(end, nextGraphemeEnd(end), "");
  }

  function restore(saved) {
    mutating = true;
    input.value = saved.value;
    input.setSelectionRange(saved.start, saved.end);
    active = saved.active ? { ...saved.active, candidates: [...saved.active.candidates] } : null;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    mutating = false;
    lastSnapshot = snapshot();
    emit();
  }

  function undo() {
    const previous = undoStack.pop();
    if (!previous) return;
    redoStack.push(snapshot());
    restore(previous);
  }

  function redo() {
    const next = redoStack.pop();
    if (!next) return;
    undoStack.push(snapshot());
    restore(next);
  }

  function onBeforeInput(event) {
    if (composing || event.isComposing) return;
    if (!event.cancelable) return;
    const kind = event.inputType;
    if (kind === "historyUndo" || kind === "historyRedo") {
      event.preventDefault();
      kind === "historyUndo" ? undo() : redo();
      return;
    }
    if (kind === "insertText" && typeof event.data === "string") {
      event.preventDefault();
      if (enabled && /^[a-z\^~\/=]+$/i.test(event.data)) insertRoman(event.data);
      else replace(input.selectionStart, input.selectionEnd,
        enabled ? convertTyped(event.data) : event.data);
      return;
    }
    if (kind === "insertLineBreak" || kind === "insertParagraph") {
      if (input.tagName === "INPUT") {
        active = null;
        emit();
        return;
      }
      event.preventDefault();
      replace(input.selectionStart, input.selectionEnd, "\n");
      return;
    }
    if (kind === "deleteContentBackward") {
      event.preventDefault();
      deleteBackward();
      return;
    }
    if (kind === "deleteContentForward") {
      event.preventDefault();
      deleteForward();
    }
  }

  function onInput(event) {
    if (mutating || composing || compositionBefore) return;
    if (input.value === lastSnapshot.value) return;
    const before = lastSnapshot;
    const oldText = before.value;
    const newText = input.value;
    let prefix = 0;
    while (prefix < oldText.length && prefix < newText.length && oldText[prefix] === newText[prefix]) prefix++;
    let oldEnd = oldText.length;
    let newEnd = newText.length;
    while (oldEnd > prefix && newEnd > prefix && oldText[oldEnd - 1] === newText[newEnd - 1]) {
      oldEnd--;
      newEnd--;
    }
    const inserted = newText.slice(prefix, newEnd);
    if (enabled && /^[a-z\^~\/=]+$/i.test(inserted) &&
        input.selectionStart === newEnd && input.selectionEnd === newEnd) {
      const continuing = active && oldEnd === prefix && prefix === active.end;
      const start = continuing ? active.start : prefix;
      const roman = (continuing ? active.roman : "") + inserted;
      const result = renderWord(roman);
      mutating = true;
      input.setRangeText(result.text, start, newEnd, "end");
      active = {
        start,
        end: start + result.text.length,
        roman,
        candidates: result.candidates,
        ambiguous: result.ambiguous,
        dismissed: false,
      };
      input.dispatchEvent(new Event("input", { bubbles: true }));
      mutating = false;
    } else if (enabled && inserted && /[a-z.\^~\/=|]/i.test(inserted) &&
               (event.inputType === "insertFromPaste" || /[^a-z\^~\/=]/i.test(inserted))) {
      try {
        const converted = event.inputType === "insertFromPaste"
          ? convertText(inserted)
          : convertTyped(inserted);
        mutating = true;
        input.setRangeText(converted, prefix, newEnd, "end");
        input.dispatchEvent(new Event("input", { bubbles: true }));
        mutating = false;
      } catch { mutating = false; }
      active = null;
    } else {
      active = null;
    }
    undoStack.push(before);
    if (undoStack.length > 200) undoStack.shift();
    redoStack.length = 0;
    lastSnapshot = snapshot();
    emit();
  }

  function onPaste(event) {
    const pasted = event.clipboardData?.getData("text/plain");
    if (typeof pasted !== "string") return;
    event.preventDefault();
    let text = pasted;
    if (enabled) {
      try { text = convertText(pasted); } catch { /* Keep the original paste. */ }
    }
    replace(input.selectionStart, input.selectionEnd, text);
  }

  function onCut(event) {
    if (input.selectionStart === input.selectionEnd || !event.clipboardData) return;
    event.clipboardData.setData("text/plain", input.value.slice(input.selectionStart, input.selectionEnd));
    event.preventDefault();
    replace(input.selectionStart, input.selectionEnd, "");
  }

  function onKeyDown(event) {
    if (event.isComposing) return;
    const modifier = event.metaKey || event.ctrlKey;
    const key = event.key.toLowerCase();
    if (modifier && !event.altKey && key === "z") {
      event.preventDefault();
      event.shiftKey ? redo() : undo();
      return;
    }
    if (modifier && !event.altKey && key === "y") {
      event.preventDefault();
      redo();
      return;
    }
    if (event.altKey && !modifier && /^[1-9]$/.test(event.key) && state().candidates.length) {
      const index = Number(event.key) - 1;
      if (index < state().candidates.length) {
        event.preventDefault();
        chooseCandidate(index);
      }
      return;
    }
    if (event.key === "Escape" && active) {
      active.dismissed = true;
      emit();
    }
    if (/^(Arrow|Home|End|Page)/.test(event.key) && active) {
      active = null;
      emit();
    }
  }

  function onSelectionChange() {
    if (ownerDocument.activeElement !== input || !active) return;
    if (input.selectionStart !== active.end || input.selectionEnd !== active.end) {
      active = null;
      emit();
    }
  }

  function onCompositionStart() {
    if (compositionTimer !== null) clearTimeout(compositionTimer);
    compositionTimer = null;
    compositionBefore = snapshot();
    composing = true;
    active = null;
    emit();
  }

  function onCompositionEnd() {
    composing = false;
    // Some mobile keyboards dispatch their final input event after compositionend.
    compositionTimer = setTimeout(() => {
      compositionTimer = null;
      if (destroyed || !compositionBefore) return;
      const before = compositionBefore;
      compositionBefore = null;
      const oldText = before.value;
      const newText = input.value;
      if (oldText === newText) {
        active = before.active;
        lastSnapshot = snapshot();
        emit();
        return;
      }
      let prefix = 0;
      while (prefix < oldText.length && prefix < newText.length && oldText[prefix] === newText[prefix]) prefix++;
      let oldEnd = oldText.length;
      let newEnd = newText.length;
      while (oldEnd > prefix && newEnd > prefix && oldText[oldEnd - 1] === newText[newEnd - 1]) {
        oldEnd--;
        newEnd--;
      }
      const inserted = newText.slice(prefix, newEnd);
      if (enabled && /^[a-z\^~\/=]+$/i.test(inserted)) {
        const continuing = before.active && before.start === before.end &&
          oldEnd === prefix && prefix === before.active.end;
        const start = continuing ? before.active.start : prefix;
        const roman = (continuing ? before.active.roman : "") + inserted;
        const result = renderWord(roman);
        mutating = true;
        input.setRangeText(result.text, start, newEnd, "end");
        active = {
          start,
          end: start + result.text.length,
          roman,
          candidates: result.candidates,
          ambiguous: result.ambiguous,
          dismissed: false,
        };
        input.dispatchEvent(new Event("input", { bubbles: true }));
        mutating = false;
      } else if (enabled && /[a-z.\^~\/=|]/i.test(inserted)) {
        try {
          mutating = true;
          input.setRangeText(convertTyped(inserted), prefix, newEnd, "end");
          input.dispatchEvent(new Event("input", { bubbles: true }));
          mutating = false;
        } catch { mutating = false; }
      }
      undoStack.push(before);
      if (undoStack.length > 200) undoStack.shift();
      redoStack.length = 0;
      lastSnapshot = snapshot();
      emit();
    }, 0);
  }

  function chooseCandidate(index) {
    if (!active || !active.ambiguous || active.dismissed) return;
    const candidate = active.candidates[index];
    if (!candidate) return;
    const nextActive = {
      ...active,
      end: active.start + candidate.length,
      dismissed: true,
    };
    replace(active.start, active.end, candidate, nextActive);
    input.focus();
  }

  function setEnabled(next) {
    enabled = Boolean(next);
    active = null;
    lastSnapshot = snapshot();
    emit();
  }

  function setText(text) {
    replace(0, input.value.length, String(text));
  }

  function insertPunctuation(mark = "।") {
    if (mark !== "।" && mark !== "॥") {
      throw new TypeError("insertPunctuation expects a Devanagari full stop mark");
    }
    replace(input.selectionStart, input.selectionEnd, mark);
  }

  function insertMark(mark) {
    if (mark !== "ं" && mark !== "ँ") {
      throw new TypeError("insertMark expects bindu or chandrabindu");
    }
    if (enabled) insertRoman(mark === "ं" ? "^" : "~");
    else replace(input.selectionStart, input.selectionEnd, mark);
  }

  input.addEventListener("beforeinput", onBeforeInput);
  input.addEventListener("input", onInput);
  input.addEventListener("paste", onPaste);
  input.addEventListener("cut", onCut);
  input.addEventListener("keydown", onKeyDown);
  input.addEventListener("compositionstart", onCompositionStart);
  input.addEventListener("compositionend", onCompositionEnd);
  ownerDocument.addEventListener("selectionchange", onSelectionChange);
  emit();

  return {
    getState: state,
    chooseCandidate,
    setEnabled,
    setText,
    insertPunctuation,
    insertMark,
    undo,
    redo,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (compositionTimer !== null) clearTimeout(compositionTimer);
      compositionTimer = null;
      compositionBefore = null;
      input.removeEventListener("beforeinput", onBeforeInput);
      input.removeEventListener("input", onInput);
      input.removeEventListener("paste", onPaste);
      input.removeEventListener("cut", onCut);
      input.removeEventListener("keydown", onKeyDown);
      input.removeEventListener("compositionstart", onCompositionStart);
      input.removeEventListener("compositionend", onCompositionEnd);
      ownerDocument.removeEventListener("selectionchange", onSelectionChange);
    },
  };
}

/**
 * Attach the browser adapter to every marked field within a root.
 * A MutationObserver keeps dynamically added and removed fields in sync.
 */
export function attachNepaliInputs(root = globalThis.document, {
  selector = "[data-sahajlipi]",
  convertWord = defaultConvertWord,
  convertText = defaultConvertText,
  onStateChange,
} = {}) {
  if (!root || typeof root.querySelectorAll !== "function") {
    throw new TypeError("attachNepaliInputs expects a document or element root");
  }
  if (typeof selector !== "string" || !selector.trim()) {
    throw new TypeError("selector must be a non-empty CSS selector");
  }
  if (typeof convertWord !== "function" || typeof convertText !== "function") {
    throw new TypeError("convertWord and convertText must be functions");
  }
  if (onStateChange !== undefined && typeof onStateChange !== "function") {
    throw new TypeError("onStateChange must be a function");
  }

  const controllers = new Map();
  let destroyed = false;

  function refresh() {
    if (destroyed) return;
    const matches = new Set(root.querySelectorAll(selector));
    if (typeof root.matches === "function" && root.matches(selector)) matches.add(root);
    for (const field of matches) {
      if (!isSupportedField(field)) continue;
      if (!controllers.has(field)) {
        let registered = false;
        let pendingInitial = false;
        const controller = attachNepaliInput(field, {
          convertWord,
          convertText,
          onStateChange: onStateChange
            ? (state) => {
                if (!registered) pendingInitial = true;
                else {
                  pendingInitial = false;
                  onStateChange(state, field);
                }
              }
            : undefined,
        });
        controllers.set(field, controller);
        registered = true;
        if (onStateChange) {
          queueMicrotask(() => {
            if (pendingInitial && !destroyed && controllers.get(field) === controller) {
              pendingInitial = false;
              onStateChange(controller.getState(), field);
            }
          });
        }
      }
    }
    for (const [field, controller] of controllers) {
      if (!matches.has(field) || !isSupportedField(field)) {
        controller.destroy();
        controllers.delete(field);
      }
    }
  }

  refresh();
  function containsEligibleOrManaged(node) {
    if (controllers.has(node)) return true;
    if (typeof node.matches === "function" && node.matches(selector) &&
        isSupportedField(node)) return true;
    if (typeof node.querySelectorAll === "function" &&
        [...node.querySelectorAll(selector)].some(isSupportedField)) return true;
    for (const field of controllers.keys()) {
      if (typeof node.contains === "function" && node.contains(field)) return true;
    }
    return false;
  }

  function onMutations(records) {
    if (records.some((record) => {
      if (record.type === "attributes") return containsEligibleOrManaged(record.target);
      if (record.type === "childList") {
        return [...record.addedNodes, ...record.removedNodes]
          .some(containsEligibleOrManaged);
      }
      return false;
    })) refresh();
  }

  const Observer = root.defaultView?.MutationObserver ??
    root.ownerDocument?.defaultView?.MutationObserver ??
    globalThis.MutationObserver;
  const observer = typeof Observer === "function"
    ? new Observer(onMutations)
    : null;
  const observeOptions = { childList: true, subtree: true, attributes: true };
  if (selector === "[data-sahajlipi]") {
    observeOptions.attributeFilter = ["data-sahajlipi", "type"];
  }
  observer?.observe(root, observeOptions);

  return {
    refresh,
    getController(field) {
      return controllers.get(field) ?? null;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      observer?.disconnect();
      for (const controller of controllers.values()) controller.destroy();
      controllers.clear();
    },
  };
}
