import { createEngine } from 'sahajlipi';
import { attachNepaliInput, attachNepaliInputs } from 'sahajlipi/dom';
import type {
  InputState, NepaliInputController, NepaliInputField, NepaliInputOptions,
  NepaliInputsController, NepaliInputsOptions,
} from 'sahajlipi/dom';

const engine = createEngine({ digits: 'latin' });
const textarea = document.createElement('textarea');
const input = document.createElement('input');
const options: NepaliInputOptions = {
  ...engine,
  enabled: true,
  onStateChange(state: InputState) {
    const text: string = state.text;
    const enabled: boolean = state.enabled;
    const active: string = state.activeRoman;
    const candidates: string[] = state.candidates;
    void [text, enabled, active, candidates];
  },
};
const controller: NepaliInputController = attachNepaliInput(textarea, options);
attachNepaliInput(input);
controller.chooseCandidate(0);
controller.setEnabled(false);
controller.setText('ओजस');
controller.insertPunctuation('।');
controller.insertMark('ँ');
controller.undo();
controller.redo();
const state: InputState = controller.getState();
void state;

const managedOptions: NepaliInputsOptions = {
  scope: 'all', selector: 'textarea', excludeSelector: '[lang="en"]',
  ...engine,
  onStateChange(value: InputState, field: NepaliInputField) {
    field.value = value.text;
  },
};
const manager: NepaliInputsController = attachNepaliInputs(document, managedOptions);
attachNepaliInputs(document.createElement('section'), { scope: 'marked' });
attachNepaliInputs();
const maybeController: NepaliInputController | null = manager.getController(textarea);
const enabled: boolean = manager.getEnabled();
void [maybeController, enabled];
manager.refresh();
manager.setEnabled(false);
manager.destroy();
controller.destroy();

// @ts-expect-error One-field attachment requires an input or textarea.
attachNepaliInput(document.createElement('div'));
// @ts-expect-error Manager root is a document or element.
attachNepaliInputs(window);
// @ts-expect-error Scope names are the documented marked/all modes.
attachNepaliInputs(document, { scope: 'page' });
// @ts-expect-error Enabled state is boolean.
controller.setEnabled('false');
// @ts-expect-error Candidate selection uses a numeric index.
controller.chooseCandidate('first');
// @ts-expect-error Marks are limited to bindu and chandrabindu.
controller.insertMark('.');
// @ts-expect-error Converter callbacks must return the complete conversion shape.
attachNepaliInput(input, { convertWord: (roman) => roman });
// @ts-expect-error State callback candidates are strings.
const unsupportedCandidates: number[] = controller.getState().candidates;
void unsupportedCandidates;
