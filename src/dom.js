/**
 * Attach inline Roman Nepali conversion to a textarea.
 *
 * The adapter keeps the Roman spelling of the word at the caret. This lets
 * Backspace edit that spelling even when its Nepali rendering has a different
 * number of characters. The engine is injected so the input behavior can be
 * reused and tested independently.
 */
export function attachNepaliInput(input, { convertWord, convertText, onStateChange = () => {} }) {
  if (!input || typeof input.setRangeText !== "function") {
    throw new TypeError("attachNepaliInput expects a textarea");
  }
  if (typeof convertWord !== "function" || typeof convertText !== "function") {
    throw new TypeError("convertWord and convertText must be functions");
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
  let mutating = false;

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
    onStateChange(state());
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
    if (document.activeElement !== input || !active) return;
    if (input.selectionStart !== active.end || input.selectionEnd !== active.end) {
      active = null;
      emit();
    }
  }

  function onCompositionStart() {
    compositionBefore = snapshot();
    composing = true;
    active = null;
    emit();
  }

  function onCompositionEnd() {
    composing = false;
    // Some mobile keyboards dispatch their final input event after compositionend.
    setTimeout(() => {
      if (!compositionBefore) return;
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
  document.addEventListener("selectionchange", onSelectionChange);
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
      input.removeEventListener("beforeinput", onBeforeInput);
      input.removeEventListener("input", onInput);
      input.removeEventListener("paste", onPaste);
      input.removeEventListener("cut", onCut);
      input.removeEventListener("keydown", onKeyDown);
      input.removeEventListener("compositionstart", onCompositionStart);
      input.removeEventListener("compositionend", onCompositionEnd);
      document.removeEventListener("selectionchange", onSelectionChange);
    },
  };
}
