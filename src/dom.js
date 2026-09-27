import { convertText as defaultConvertText, convertWord as defaultConvertWord } from "./index.js";
import { findProtectedSpans } from "./text-policy.js";

const MARKED_SELECTOR = "[data-sahajlipi]";
const ALL_FIELDS_SELECTOR = "textarea, input";
const DEFAULT_EXCLUDE_SELECTOR = "[data-sahajlipi-ignore]";
const attachedFields = new WeakSet();

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
  enabled: initialEnabled = true,
} = {}) {
  if (!isSupportedField(input)) {
    throw new TypeError("attachNepaliInput expects a textarea or text/search input");
  }
  if (attachedFields.has(input)) {
    throw new TypeError("This field already has a SahajLipi adapter attached");
  }
  if (typeof convertWord !== "function" || typeof convertText !== "function") {
    throw new TypeError("convertWord and convertText must be functions");
  }
  if (typeof onStateChange !== "function") {
    throw new TypeError("onStateChange must be a function");
  }
  if (typeof initialEnabled !== "boolean") {
    throw new TypeError("enabled must be a boolean");
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
  let enabled = initialEnabled;
  let active = null;
  // Retain the source token across punctuation until its technical shape is clear.
  let token = null;
  let composing = false;
  let compositionBefore = null;
  let compositionTimer = null;
  let mutating = false;
  let destroyed = false;

  const cloneToken = (value) => value ? {
    ...value,
    choices: value.choices.map((choice) => ({ ...choice })),
  } : null;
  const snapshot = () => ({
    value: input.value,
    start: input.selectionStart,
    end: input.selectionEnd,
    active: active ? { ...active, candidates: [...active.candidates] } : null,
    token: cloneToken(token),
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
        before.end === input.selectionEnd && sameActive &&
        JSON.stringify(before.token) === JSON.stringify(token)) {
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

  function replace(start, end, text, nextActive = null, nextToken = null, caret = start + text.length) {
    const before = snapshot();
    mutating = true;
    input.setRangeText(text, start, end, "end");
    active = nextActive;
    token = nextToken;
    input.setSelectionRange(caret, caret);
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

  function convertTyped(text) {
    if (!text) return '';
    try { return convertText(text); } catch { return text; }
  }

  function protectedSpans(text) {
    // The supplied text converter remains authoritative, including its opt-out.
    return findProtectedSpans(text).filter(({ start, end }) => {
      const source = text.slice(start, end);
      return convertTyped(source) === source;
    });
  }

  function renderToken(roman, choices = [], wordConversion = true) {
    const spans = protectedSpans(roman);
    const validChoices = choices.filter((choice) => choice.end <= roman.length &&
      !spans.some((span) => choice.start < span.end && choice.end > span.start));
    function renderUntil(end) {
      let output = '';
      let cursor = 0;
      for (const choice of validChoices) {
        if (choice.end > end) break;
        output += convertTyped(roman.slice(cursor, choice.start)) + choice.text;
        cursor = choice.end;
      }
      return output + convertTyped(roman.slice(cursor, end));
    }
    const match = /[a-z\^~\/=]+$/i.exec(roman);
    if (!wordConversion || !match || spans.some((span) => match.index < span.end && roman.length > span.start)) {
      return { text: renderUntil(roman.length), active: null, choices: validChoices };
    }
    const prefix = renderUntil(match.index);
    const word = renderWord(match[0]);
    const chosen = validChoices.find((choice) => choice.start === match.index && choice.end === roman.length);
    const text = prefix + (chosen?.text ?? word.text);
    return { text, choices: validChoices, active: {
      start: prefix.length,
      end: text.length,
      roman: match[0],
      candidates: word.candidates,
      ambiguous: word.ambiguous,
      dismissed: Boolean(chosen?.dismissed),
      rawStart: match.index,
    } };
  }

  function insertionContext(start, end) {
    if (token && start === token.end && end === token.end) {
      return { ...cloneToken(token), suffix: '' };
    }
    // Existing literal addresses can be edited, including after paste or caret movement.
    let left = start;
    let right = end;
    while (left > 0 && !/\s/u.test(input.value[left - 1])) left--;
    while (right < input.value.length && !/\s/u.test(input.value[right])) right++;
    const visible = input.value.slice(left, right);
    const span = protectedSpans(visible).find((item) =>
      start >= left + item.start && end <= left + item.end &&
      (start < left + item.end || start === end));
    if (!span) return { start, end, roman: '', choices: [], suffix: '' };
    const spanStart = left + span.start;
    const spanEnd = left + span.end;
    return {
      start: spanStart, end: spanEnd,
      roman: input.value.slice(spanStart, start),
      suffix: input.value.slice(end, spanEnd),
      choices: [],
    };
  }

  function insertText(text, commit = false) {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    if (!enabled) {
      replace(start, end, text);
      return;
    }
    const context = insertionContext(start, end);
    const prefix = context.roman;
    const raw = prefix + text + context.suffix;
    if (commit && (protectedSpans(text).some((span) => span.start === 0) ||
        !protectedSpans(raw).some((span) => span.start < prefix.length && span.end > prefix.length))) {
      // A normal paste is a complete text operation, not another sound in the
      // active word. Only an address crossing the caret needs source restoration.
      replace(start, end, convertTyped(text));
      return;
    }
    // Appending a sound edits the active word; a candidate choice remains committed
    // when punctuation or whitespace follows it.
    const choices = context.choices.filter((choice) =>
      !(choice.end === prefix.length && /^[a-z\^~\/=]/i.test(text)));
    if (active && token && context.start === token.start && !/^[a-z\^~\/=]/i.test(text)) {
      const rawStart = active.rawStart;
      const rawEnd = rawStart + active.roman.length;
      if (!choices.some((choice) => choice.start === rawStart && choice.end === rawEnd)) {
        choices.push({ start: rawStart, end: rawEnd,
          text: input.value.slice(active.start, active.end), dismissed: active.dismissed });
      }
    }
    if (commit || text.length > 1 && !/^[a-z\^~\/=]+$/i.test(text)) {
      const result = renderToken(raw, choices, false);
      const caret = context.suffix && result.text.endsWith(context.suffix)
        ? context.start + result.text.length - context.suffix.length
        : context.start + result.text.length;
      replace(context.start, context.end, result.text, null, null, caret);
      return;
    }
    let output = '';
    let nextToken = null;
    let nextActive = null;
    for (const part of raw.matchAll(/\s+|\S+/gu)) {
      if (/^\s/u.test(part[0])) {
        output += convertTyped(part[0]);
        nextToken = null;
        nextActive = null;
        continue;
      }
      const partChoices = choices.filter((choice) =>
        choice.start >= part.index && choice.end <= part.index + part[0].length)
        .map((choice) => ({ ...choice, start: choice.start - part.index, end: choice.end - part.index }));
      const result = renderToken(part[0], partChoices);
      const partStart = context.start + output.length;
      output += result.text;
      nextToken = { start: partStart, end: context.start + output.length,
        roman: part[0], choices: result.choices };
      nextActive = result.active ? { ...result.active,
        start: partStart + result.active.start, end: partStart + result.active.end } : null;
    }
    let caret = context.start + output.length;
    if (context.suffix) {
      // Protected text is byte-for-byte literal, so an interior caret keeps its offset.
      caret = context.start + (output.endsWith(context.suffix)
        ? output.length - context.suffix.length : convertTyped(prefix + text).length);
      nextActive = null;
      nextToken = null;
    }
    replace(context.start, context.end, output, nextActive, nextToken, caret);
  }

  function insertRoman(letters) { insertText(letters); }

  function previousGraphemeStart(caret, text = input.value) {
    const prefix = text.slice(0, caret);
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
    } else if (enabled && token && end === token.end) {
      const roman = token.roman.slice(0, previousGraphemeStart(token.roman.length, token.roman));
      if (!roman) {
        replace(token.start, token.end, '');
      } else {
        const result = renderToken(roman, token.choices.filter((choice) => choice.end < token.roman.length));
        const nextToken = { ...cloneToken(token), roman,
          end: token.start + result.text.length, choices: result.choices };
        const nextActive = result.active ? { ...result.active,
          start: token.start + result.active.start, end: token.start + result.active.end } : null;
        replace(token.start, token.end, result.text, nextActive, nextToken);
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
    token = cloneToken(saved.token);
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
      insertText(event.data);
      return;
    }
    if (kind === "insertLineBreak" || kind === "insertParagraph") {
      if (input.tagName === "INPUT") {
        active = null;
        token = null;
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

  function reconcileNative(before, eventType) {
    const oldText = before.value;
    const newText = input.value;
    if (oldText === newText) {
      active = before.active;
      token = cloneToken(before.token);
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
    // A string diff alone can place repeated letters on the wrong side of the
    // caret. Prefer the caret when the surrounding text proves a pure insertion.
    const growth = newText.length - oldText.length;
    const caret = input.selectionStart;
    const insertionStart = caret - growth;
    if (growth > 0 && input.selectionEnd === caret && insertionStart >= 0 &&
        oldText.slice(0, insertionStart) === newText.slice(0, insertionStart) &&
        oldText.slice(insertionStart) === newText.slice(caret)) {
      prefix = insertionStart;
      oldEnd = insertionStart;
      newEnd = caret;
    }
    const inserted = newText.slice(prefix, newEnd);
    const atInsertion = input.selectionStart === newEnd && input.selectionEnd === newEnd;
    if (enabled && inserted && atInsertion) {
      input.value = oldText;
      input.setSelectionRange(prefix, oldEnd);
      active = before.active;
      token = cloneToken(before.token);
      insertText(inserted, eventType === 'insertFromPaste');
      // Native insertion should undo to the selection before the browser's edit.
      undoStack[undoStack.length - 1] = before;
      return;
    }
    active = null;
    token = null;
    remember(before);
  }

  function onInput(event) {
    if (mutating || composing || compositionBefore) return;
    if (input.value === lastSnapshot.value) return;
    reconcileNative(lastSnapshot, event.inputType);
  }

  function onPaste(event) {
    const pasted = event.clipboardData?.getData("text/plain");
    if (typeof pasted !== "string") return;
    event.preventDefault();
    insertText(pasted, true);
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
    if (/^(Arrow|Home|End|Page)/.test(event.key) && (active || token)) {
      active = null;
      token = null;
      emit();
    }
  }

  function onSelectionChange() {
    if (ownerDocument.activeElement !== input || (!active && !token)) return;
    const end = token?.end ?? active.end;
    if (input.selectionStart !== end || input.selectionEnd !== end) {
      active = null;
      token = null;
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
      reconcileNative(before, 'insertCompositionText');
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
    const nextToken = cloneToken(token);
    if (nextToken) {
      nextToken.choices = nextToken.choices.filter((choice) => choice.end <= active.rawStart);
      nextToken.choices.push({ start: active.rawStart, end: active.rawStart + active.roman.length, text: candidate, dismissed: true });
      nextToken.end += candidate.length - (active.end - active.start);
    }
    replace(active.start, active.end, candidate, nextActive, nextToken);
    input.focus();
  }

  function setEnabled(next) {
    enabled = Boolean(next);
    active = null;
    token = null;
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

  function removeListeners() {
    input.removeEventListener("beforeinput", onBeforeInput);
    input.removeEventListener("input", onInput);
    input.removeEventListener("paste", onPaste);
    input.removeEventListener("cut", onCut);
    input.removeEventListener("keydown", onKeyDown);
    input.removeEventListener("compositionstart", onCompositionStart);
    input.removeEventListener("compositionend", onCompositionEnd);
    ownerDocument.removeEventListener("selectionchange", onSelectionChange);
  }

  input.addEventListener("beforeinput", onBeforeInput);
  input.addEventListener("input", onInput);
  input.addEventListener("paste", onPaste);
  input.addEventListener("cut", onCut);
  input.addEventListener("keydown", onKeyDown);
  input.addEventListener("compositionstart", onCompositionStart);
  input.addEventListener("compositionend", onCompositionEnd);
  ownerDocument.addEventListener("selectionchange", onSelectionChange);
  attachedFields.add(input);
  try {
    emit();
  } catch (error) {
    removeListeners();
    attachedFields.delete(input);
    throw error;
  }

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
      removeListeners();
      attachedFields.delete(input);
    },
  };
}

/**
 * Attach the browser adapter to eligible fields within a document or element root.
 * A MutationObserver keeps dynamically added and removed fields in sync.
 */
export function attachNepaliInputs(root = globalThis.document, {
  scope = "marked",
  selector,
  excludeSelector = DEFAULT_EXCLUDE_SELECTOR,
  enabled: initialEnabled = true,
  convertWord = defaultConvertWord,
  convertText = defaultConvertText,
  onStateChange,
} = {}) {
  if (!root || typeof root.querySelectorAll !== "function") {
    throw new TypeError("attachNepaliInputs expects a document or element root");
  }
  if (scope !== "marked" && scope !== "all") {
    throw new TypeError("scope must be 'marked' or 'all'");
  }
  const fieldSelector = selector ?? (scope === "all" ? ALL_FIELDS_SELECTOR : MARKED_SELECTOR);
  if (typeof fieldSelector !== "string" || !fieldSelector.trim()) {
    throw new TypeError("selector must be a non-empty CSS selector");
  }
  if (typeof excludeSelector !== "string" || !excludeSelector.trim()) {
    throw new TypeError("excludeSelector must be a non-empty CSS selector");
  }
  if (typeof initialEnabled !== "boolean") {
    throw new TypeError("enabled must be a boolean");
  }
  if (typeof convertWord !== "function" || typeof convertText !== "function") {
    throw new TypeError("convertWord and convertText must be functions");
  }
  if (onStateChange !== undefined && typeof onStateChange !== "function") {
    throw new TypeError("onStateChange must be a function");
  }

  const controllers = new Map();
  let enabled = initialEnabled;
  let destroyed = false;
  const isExcluded = (field) => typeof field.matches === "function" &&
    field.matches(excludeSelector);

  function refresh() {
    if (destroyed) return;
    const matches = new Set(root.querySelectorAll(fieldSelector));
    if (typeof root.matches === "function" && root.matches(fieldSelector)) matches.add(root);
    const eligible = [...matches].filter((field) => isSupportedField(field) && !isExcluded(field));
    for (const field of eligible) {
      if (!controllers.has(field) && attachedFields.has(field)) {
        throw new TypeError("This field already has a SahajLipi adapter attached");
      }
    }
    for (const field of eligible) {
      if (!controllers.has(field)) {
        let registered = false;
        let pendingInitial = false;
        const controller = attachNepaliInput(field, {
          convertWord,
          convertText,
          enabled,
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
      if (!matches.has(field) || !isSupportedField(field) || isExcluded(field)) {
        controller.destroy();
        controllers.delete(field);
      }
    }
  }

  refresh();
  function containsEligibleOrManaged(node) {
    if (controllers.has(node)) return true;
    if (typeof node.matches === "function" && node.matches(fieldSelector) &&
        isSupportedField(node)) return true;
    if (typeof node.querySelectorAll === "function" &&
        [...node.querySelectorAll(fieldSelector)].some(isSupportedField)) return true;
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
  if (selector === undefined && excludeSelector === DEFAULT_EXCLUDE_SELECTOR) {
    observeOptions.attributeFilter = scope === "marked"
      ? ["data-sahajlipi", "data-sahajlipi-ignore", "type"]
      : ["data-sahajlipi-ignore", "type"];
  }
  observer?.observe(root, observeOptions);

  return {
    refresh,
    getController(field) {
      return controllers.get(field) ?? null;
    },
    getEnabled() {
      return enabled;
    },
    setEnabled(next) {
      if (typeof next !== "boolean") {
        throw new TypeError("setEnabled expects a boolean");
      }
      if (destroyed) return;
      enabled = next;
      for (const controller of controllers.values()) controller.setEnabled(enabled);
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
