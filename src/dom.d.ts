import type { Conversion } from './index.js';

export interface InputState {
  text: string;
  enabled: boolean;
  activeRoman: string;
  candidates: string[];
}

export interface NepaliInputController {
  getState(): InputState;
  chooseCandidate(index: number): void;
  setEnabled(enabled: boolean): void;
  setText(text: string): void;
  insertPunctuation(mark?: '।' | '॥'): void;
  insertMark(mark: 'ं' | 'ँ'): void;
  undo(): void;
  redo(): void;
  destroy(): void;
}

export type NepaliInputField = HTMLTextAreaElement | HTMLInputElement;

export interface NepaliInputOptions {
  convertWord?(roman: string): Conversion;
  convertText?(text: string): string;
  onStateChange?(state: InputState): void;
}

export interface NepaliInputsOptions {
  selector?: string;
  convertWord?(roman: string): Conversion;
  convertText?(text: string): string;
  onStateChange?(state: InputState, field: NepaliInputField): void;
}

export interface NepaliInputsController {
  refresh(): void;
  getController(field: NepaliInputField): NepaliInputController | null;
  destroy(): void;
}

/** Accepts a textarea, text input, or search input. */
export function attachNepaliInput(
  input: NepaliInputField,
  options?: NepaliInputOptions,
): NepaliInputController;

/** Attaches to marked fields in a document or element; observes DOM changes when available. */
export function attachNepaliInputs(
  root?: Document | Element,
  options?: NepaliInputsOptions,
): NepaliInputsController;
