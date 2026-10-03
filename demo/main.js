import { attachNepaliInputs } from "../src/dom.js";
import { createEngine } from "../src/index.js";

const field = document.querySelector("#typing-field");
const candidatePanel = document.querySelector("#candidate-panel");
const candidateSelect = document.querySelector("#candidate-select");
const romanSpelling = document.querySelector("#roman-spelling");
const characterCount = document.querySelector("#character-count");
const modeButton = document.querySelector("#mode-button");
const consonantSelect = document.querySelector("#consonant-select");
const copyButton = document.querySelector("#copy-button");
const clearButton = document.querySelector("#clear-button");

function render({ text, enabled, activeRoman, candidates }) {
  characterCount.textContent = `${Array.from(text).length} ${Array.from(text).length === 1 ? "character" : "characters"}`;
  modeButton.textContent = enabled ? "Nepali mode" : "English mode";
  modeButton.title = `Switch all marked fields to ${enabled ? "English" : "Nepali"} mode`;
  field.setAttribute("aria-label", enabled ? "Type Roman Nepali here" : "Type literal English here");
  modeButton.setAttribute("aria-pressed", String(enabled));

  candidatePanel.hidden = candidates.length < 2;
  romanSpelling.textContent = activeRoman;
  candidateSelect.replaceChildren();
  candidates.forEach((candidate, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = candidate;
    candidateSelect.append(option);
  });
}

// One manager attaches every marked field, including the form examples below.
let engine = createEngine({ consonantMode: consonantSelect.value });
const manager = attachNepaliInputs(document, {
  convertWord: (word) => engine.convertWord(word),
  convertText: (text) => engine.convertText(text),
  onStateChange(state, changedField) {
    if (changedField === field) render(state);
  },
});
const controller = manager.getController(field);

candidateSelect.addEventListener("change", () => {
  controller.chooseCandidate(Number(candidateSelect.value));
});

modeButton.addEventListener("click", () => {
  manager.setEnabled(!controller.getState().enabled);
  field.focus();
});

consonantSelect.addEventListener("change", () => {
  engine = createEngine({ consonantMode: consonantSelect.value });
  // Finish each current word while keeping the text and English/Nepali mode.
  manager.setEnabled(manager.getEnabled());
  field.focus();
});

clearButton.addEventListener("click", () => {
  controller.setText("");
  field.focus();
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(field.value);
    copyButton.textContent = "Copied";
    setTimeout(() => { copyButton.textContent = "Copy"; }, 1600);
  } catch {
    field.focus();
    field.select();
    copyButton.textContent = "Select text to copy";
    setTimeout(() => { copyButton.textContent = "Copy"; }, 2200);
  }
});
