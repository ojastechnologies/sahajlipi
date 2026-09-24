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
  /** Whether new typing is transliterated. Defaults to true. */
  enabled?: boolean;
  convertWord?(roman: string): Conversion;
  convertText?(text: string): string;
  onStateChange?(state: InputState): void;
}

export interface NepaliInputsOptions {
  /** 'marked' uses data-sahajlipi; 'all' selects supported fields in the root. */
  scope?: 'marked' | 'all';
  /** Overrides the field selector implied by scope. */
  selector?: string;
  /** Fields matching this selector stay untouched. Defaults to data-sahajlipi-ignore. */
  excludeSelector?: string;
  /** Initial mode for all current and future managed fields. Defaults to true. */
  enabled?: boolean;
  convertWord?(roman: string): Conversion;
  convertText?(text: string): string;
  onStateChange?(state: InputState, field: NepaliInputField): void;
}

export interface NepaliInputsController {
  refresh(): void;
  getController(field: NepaliInputField): NepaliInputController | null;
  getEnabled(): boolean;
  setEnabled(enabled: boolean): void;
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
