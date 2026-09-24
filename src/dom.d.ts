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

export interface NepaliInputOptions {
  convertWord(roman: string): Conversion;
  convertText(text: string): string;
  onStateChange?(state: InputState): void;
}

export function attachNepaliInput(
  input: HTMLTextAreaElement,
  options: NepaliInputOptions,
): NepaliInputController;
