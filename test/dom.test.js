import test from "node:test";
import assert from "node:assert/strict";
import { attachNepaliInput } from "../src/dom.js";
import { convertText, convertWord } from "../src/index.js";

class FakeTextarea extends EventTarget {
  value = "";
  selectionStart = 0;
  selectionEnd = 0;

  setSelectionRange(start, end) {
    this.selectionStart = start;
    this.selectionEnd = end;
  }

  setRangeText(text, start, end, selectionMode = "preserve") {
    this.value = this.value.slice(0, start) + text + this.value.slice(end);
    if (selectionMode === "end") this.setSelectionRange(start + text.length, start + text.length);
  }

  focus() {
    document.activeElement = this;
  }
}

function setup(t) {
  const fakeDocument = new EventTarget();
  const field = new FakeTextarea();
  fakeDocument.activeElement = field;
  globalThis.document = fakeDocument;
  const controller = attachNepaliInput(field, { convertWord, convertText });
  t.after(() => {
    controller.destroy();
    delete globalThis.document;
  });

  function beforeInput(inputType, data = null) {
    const event = new Event("beforeinput", { cancelable: true });
    Object.defineProperties(event, {
      inputType: { value: inputType },
      data: { value: data },
    });
    field.dispatchEvent(event);
    assert.equal(event.defaultPrevented, true);
  }

  function type(text) {
    for (const letter of text) beforeInput("insertText", letter);
  }

  return { field, controller, beforeInput, type };
}

test("direct typing shows the best reading and only offers genuine ambiguity", (t) => {
  const { field, controller, type, beforeInput } = setup(t);
  type("kam");
  assert.equal(field.value, "कम");
  assert.equal(controller.getState().activeRoman, "kam");
  assert.deepEqual(controller.getState().candidates, ["कम", "काम"]);

  beforeInput("insertText", " ");
  assert.equal(field.value, "कम ");
  assert.deepEqual(controller.getState().candidates, []);
  assert.equal(controller.getState().activeRoman, "");
});

test("single and double a spellings remain distinct while typing", (t) => {
  const { field, controller, type } = setup(t);
  type("pani paani");
  assert.equal(field.value, "पनि पानी");
  assert.deepEqual(controller.getState().candidates, []);
});

test("unvoweled consonants stay half while the next vowel completes them", (t) => {
  const { field, controller, type, beforeInput } = setup(t);
  type("k");
  assert.equal(field.value, "क्");
  assert.equal(controller.getState().activeRoman, "k");
  type("a");
  assert.equal(field.value, "क");
  controller.setText("");
  type("kr");
  assert.equal(field.value, "क्र्");
  beforeInput("deleteContentBackward");
  assert.equal(field.value, "क्");
  type("ra");
  assert.equal(field.value, "क्र");
});

test("paryo uses the explicit ra-ya form without an incorrect alternative", (t) => {
  const { field, controller, type } = setup(t);
  type("paryo");
  assert.equal(field.value, "पर्‍यो");
  assert.deepEqual(controller.getState().candidates, []);
});

test("bindu and chandrabindu type inline and remain editable by Backspace", (t) => {
  const { field, controller, type, beforeInput } = setup(t);
  type("ka^");
  assert.equal(field.value, "कं");
  assert.equal(controller.getState().activeRoman, "ka^");
  beforeInput("deleteContentBackward");
  assert.equal(field.value, "क");
  assert.equal(controller.getState().activeRoman, "ka");
  type("a~");
  assert.equal(field.value, "काँ");
});

test("the mark insertion API inserts at the caret and keeps the Roman spelling editable", (t) => {
  const { field, controller, type, beforeInput } = setup(t);
  type("ka");
  controller.insertMark("ं");
  assert.equal(field.value, "कं");
  beforeInput("deleteContentBackward");
  assert.equal(field.value, "क");
  type("a");
  controller.insertMark("ँ");
  assert.equal(field.value, "काँ");
  assert.throws(() => controller.insertMark("."), TypeError);
});

test("slash types an editable half consonant and slash-equals controls its shape", (t) => {
  const { field, controller, type, beforeInput } = setup(t);
  type("k/");
  assert.equal(field.value, "क्");
  assert.equal(controller.getState().activeRoman, "k/");
  beforeInput("deleteContentBackward");
  assert.equal(field.value, "क्");
  assert.equal(controller.getState().activeRoman, "k");
  type("/=");
  assert.equal(field.value, "क्‍");
  controller.setText("");
  type("par/=yo");
  assert.equal(field.value, "पर्‍यो");
});

test("undo restores the Roman spelling when an explicit halant leaves the text unchanged", (t) => {
  const { field, controller, type } = setup(t);
  type("k/");
  assert.equal(field.value, "क्");
  assert.equal(controller.getState().activeRoman, "k/");
  controller.undo();
  assert.equal(field.value, "क्");
  assert.equal(controller.getState().activeRoman, "k");
});

test("pipe types full stop after numbers while slash stays literal in dates", (t) => {
  const { field, type } = setup(t);
  type("3.14| 3/4");
  assert.equal(field.value, "3.14। 3/4");
});

test("Shift distinguishes retroflex T and D from dental t and d while typing", (t) => {
  const { field, controller, type } = setup(t);
  type("t T d D th Th dh Dh");
  assert.equal(field.value, "त् ट् द् ड् थ् ठ् ध् ढ्");
  assert.equal(controller.getState().activeRoman, "Dh");
});

test("Shift shortcuts for vocalic r, retroflex sha, and visarga type inline", (t) => {
  const { field, controller, type, beforeInput } = setup(t);
  type("kR Sha kaH");
  assert.equal(field.value, "कृ ष कः");
  assert.equal(controller.getState().activeRoman, "kaH");
  beforeInput("deleteContentBackward");
  assert.equal(field.value, "कृ ष क");
  assert.equal(controller.getState().activeRoman, "ka");
});

test("the period key stays English and finishes the active word", (t) => {
  const { field, controller, type } = setup(t);
  type("pani.");
  assert.equal(field.value, "पनि.");
  assert.equal(controller.getState().activeRoman, "");
  assert.deepEqual(controller.getState().candidates, []);

  controller.setEnabled(false);
  type("pani.");
  assert.equal(field.value, "पनि.pani.");
});

test("period after a digit stays decimal and explicit full stop works after a number", (t) => {
  const { field, controller, type } = setup(t);
  type("3.14 pani.");
  assert.equal(field.value, "3.14 पनि.");
  controller.insertPunctuation("।");
  assert.equal(field.value, "3.14 पनि.।");
  controller.setText("३");
  type(".१४");
  assert.equal(field.value, "३.१४");
  controller.insertPunctuation("।");
  assert.equal(field.value, "३.१४।");
});

test("a multi-character keyboard insertion converts words and punctuation", (t) => {
  const { field, beforeInput } = setup(t);
  beforeInput("insertText", "pani. 3.14|");
  assert.equal(field.value, "पनि. 3.14।");
});

test("native period input stays English after a Nepali word", (t) => {
  const { field, controller, type } = setup(t);
  type("pani");
  field.setRangeText(".", field.selectionStart, field.selectionEnd, "end");
  const event = new Event("input");
  Object.defineProperty(event, "inputType", { value: "insertText" });
  field.dispatchEvent(event);
  assert.equal(field.value, "पनि.");
  assert.equal(controller.getState().activeRoman, "");
});

test("native multi-character input keeps period and converts pipe", (t) => {
  const { field } = setup(t);
  field.setRangeText("pani. 3.14|", 0, 0, "end");
  const event = new Event("input");
  Object.defineProperty(event, "inputType", { value: "insertText" });
  field.dispatchEvent(event);
  assert.equal(field.value, "पनि. 3.14।");
});

test("a composed mobile period stays English", async (t) => {
  const { field, controller, type } = setup(t);
  type("pani");
  field.dispatchEvent(new Event("compositionstart"));
  field.setRangeText(".", field.selectionStart, field.selectionEnd, "end");
  field.dispatchEvent(new Event("compositionend"));
  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(field.value, "पनि.");
  assert.equal(controller.getState().activeRoman, "");
});

test("a composed mobile phrase keeps periods and converts pipe", async (t) => {
  const { field } = setup(t);
  field.dispatchEvent(new Event("compositionstart"));
  field.value = "pani. 3.14|";
  field.setSelectionRange(field.value.length, field.value.length);
  field.dispatchEvent(new Event("compositionend"));
  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(field.value, "पनि. 3.14।");
});

test("choosing an alternate keeps Backspace tied to the Roman spelling", (t) => {
  const { field, controller, type, beforeInput } = setup(t);
  type("kam");
  controller.chooseCandidate(1);
  assert.equal(field.value, "काम");
  assert.deepEqual(controller.getState().candidates, []);

  beforeInput("deleteContentBackward");
  assert.equal(field.value, convertWord("ka").text);
  assert.equal(controller.getState().activeRoman, "ka");

  beforeInput("insertText", "m");
  assert.equal(field.value, "कम");
  assert.deepEqual(controller.getState().candidates, ["कम", "काम"]);
});

test("selection and caret edits replace only the selected range", (t) => {
  const { field, controller, type, beforeInput } = setup(t);
  type("paani");
  field.setSelectionRange(0, 0);
  document.dispatchEvent(new Event("selectionchange"));
  type("n");
  assert.equal(field.value, convertWord("n").text + "पानी");
  assert.equal(controller.getState().activeRoman, "n");

  field.setSelectionRange(0, field.value.length);
  document.dispatchEvent(new Event("selectionchange"));
  beforeInput("insertText", "namaste");
  assert.equal(field.value, "नमस्ते");
});

test("paste converts whole text and undo restores a chosen alternate", (t) => {
  const { field, controller, type } = setup(t);
  type("kam");
  controller.chooseCandidate(1);
  assert.equal(field.value, "काम");
  controller.undo();
  assert.equal(field.value, "कम");
  controller.redo();
  assert.equal(field.value, "काम");

  field.setSelectionRange(field.value.length, field.value.length);
  const paste = new Event("paste", { cancelable: true });
  Object.defineProperty(paste, "clipboardData", {
    value: { getData: () => " namaste mero ghar" },
  });
  field.dispatchEvent(paste);
  assert.equal(paste.defaultPrevented, true);
  assert.equal(field.value, "काम" + convertText(" namaste mero ghar"));
  assert.equal(controller.getState().activeRoman, "");
});

test("pasted periods stay English and pipe becomes Nepali full stop", (t) => {
  const { field } = setup(t);
  const paste = new Event("paste", { cancelable: true });
  Object.defineProperty(paste, "clipboardData", {
    value: { getData: () => "pani. 3.14|" },
  });
  field.dispatchEvent(paste);
  assert.equal(field.value, "पनि. 3.14।");
});

test("English mode keeps Roman input literal", (t) => {
  const { field, controller, type } = setup(t);
  controller.setEnabled(false);
  type("pani");
  assert.equal(field.value, "pani");
  assert.deepEqual(controller.getState().candidates, []);
  type("^~");
  assert.equal(field.value, "pani^~");
  type("/=|");
  assert.equal(field.value, "pani^~/=|");
});

test("committed Nepali deletes a full visible grapheme", (t) => {
  const { field, type, beforeInput } = setup(t);
  type("paani");
  beforeInput("insertText", " ");
  beforeInput("deleteContentBackward");
  beforeInput("deleteContentBackward");
  assert.equal(field.value, "पा");
});

test("a mobile composition is converted after its final input event", async (t) => {
  const { field, controller } = setup(t);
  field.dispatchEvent(new Event("compositionstart"));
  field.value = "pani";
  field.setSelectionRange(4, 4);
  field.dispatchEvent(new Event("input"));
  field.dispatchEvent(new Event("compositionend"));
  // Mobile browsers can emit one more input event after compositionend.
  field.dispatchEvent(new Event("input"));
  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(field.value, "पनि");
  assert.equal(controller.getState().activeRoman, "pani");
  controller.undo();
  assert.equal(field.value, "");
});

test("a separately composed mobile vowel completes the active half consonant", async (t) => {
  const { field, controller, type } = setup(t);
  type("k");
  assert.equal(field.value, "क्");
  field.dispatchEvent(new Event("compositionstart"));
  field.setRangeText("a", field.selectionStart, field.selectionEnd, "end");
  field.dispatchEvent(new Event("compositionend"));
  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(field.value, "क");
  assert.equal(controller.getState().activeRoman, "ka");
  controller.undo();
  assert.equal(field.value, "क्");
  assert.equal(controller.getState().activeRoman, "k");
});

test("native input events still transliterate when beforeinput is unavailable", (t) => {
  const { field, controller } = setup(t);
  for (const letter of "pani") {
    field.setRangeText(letter, field.selectionStart, field.selectionEnd, "end");
    const event = new Event("input");
    Object.defineProperty(event, "inputType", { value: "insertText" });
    field.dispatchEvent(event);
  }
  assert.equal(field.value, "पनि");
  assert.deepEqual(controller.getState().candidates, []);
});

test("intercepted edits notify ordinary input listeners with converted text", (t) => {
  const { field, type } = setup(t);
  const observed = [];
  field.addEventListener("input", () => observed.push(field.value));
  type("pani");
  assert.equal(observed.length, 4);
  assert.equal(observed.at(-1), "पनि");
});
