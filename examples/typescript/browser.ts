import { createEngine } from 'sahajlipi';
import { attachNepaliInput, attachNepaliInputs } from 'sahajlipi/dom';
import type {
  InputState,
  NepaliInputController,
  NepaliInputsController,
  NepaliInputsOptions,
} from 'sahajlipi/dom';

/** Call in a browser after the form exists; destroy the result on teardown. */
export function enableForm(root: Document | Element): NepaliInputsController {
  const engine = createEngine({ digits: 'latin' });
  const options: NepaliInputsOptions = {
    scope: 'all',
    convertWord: engine.convertWord,
    convertText: engine.convertText,
    onStateChange(state, field) {
      console.log(field.id, state.text);
    },
  };
  return attachNepaliInputs(root, options);
}

/** A component that owns one field can attach directly instead. */
export function enableMessage(
  field: HTMLTextAreaElement,
  onStateChange: (state: InputState) => void,
): NepaliInputController {
  return attachNepaliInput(field, { onStateChange });
}
