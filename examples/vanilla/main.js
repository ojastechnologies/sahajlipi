import { createEngine } from 'sahajlipi';
import { attachNepaliInputs } from 'sahajlipi/dom';

const form = document.querySelector('#example-form');
const candidates = document.querySelector('#candidate-options');
const modeButton = document.querySelector('#mode-toggle');
const cleanupButton = document.querySelector('#cleanup-button');
const status = document.querySelector('#adapter-status');
const engine = createEngine({ digits: 'devanagari' });
let detached = false;

function renderCandidates(state, field) {
  candidates.replaceChildren();
  candidates.hidden = state.candidates.length < 2;
  for (const [index, text] of state.candidates.entries()) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;
    button.dataset.candidateIndex = String(index);
    // Keep the caret in its word until chooseCandidate replaces that word.
    button.addEventListener('mousedown', event => event.preventDefault());
    button.addEventListener('click', () => {
      manager.getController(field)?.chooseCandidate(index);
    });
    candidates.append(button);
  }
}

// A page container can replace this form; scope: 'all' enables every supported
// field in that container. data-sahajlipi-ignore excludes English fields.
const manager = attachNepaliInputs(form, {
  convertWord: engine.convertWord,
  convertText: engine.convertText,
  onStateChange: renderCandidates,
});

function updateMode() {
  const enabled = manager.getEnabled();
  modeButton.textContent = enabled ? 'Switch to English' : 'Switch to Nepali';
  status.textContent = enabled ? 'Nepali typing enabled' : 'English typing enabled';
}

function toggleMode() {
  manager.setEnabled(!manager.getEnabled());
  updateMode();
}

function cleanup() {
  if (detached) return;
  detached = true;
  manager.destroy();
  modeButton.removeEventListener('click', toggleMode);
  cleanupButton.removeEventListener('click', cleanup);
  window.removeEventListener('pagehide', cleanup);
  candidates.replaceChildren();
  candidates.hidden = true;
  modeButton.disabled = true;
  cleanupButton.disabled = true;
  status.textContent = 'Typing adapters detached';
}

modeButton.addEventListener('click', toggleMode);
cleanupButton.addEventListener('click', cleanup);
window.addEventListener('pagehide', cleanup);
updateMode();
