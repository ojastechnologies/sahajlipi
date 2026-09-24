export interface Conversion {
  text: string;
  candidates: string[];
  ambiguous: boolean;
}

export interface Engine {
  convertWord(roman: string): Conversion;
  convertText(text: string): string;
}

export interface EngineOptions {
  /** Roman spellings mapped to preferred output followed by alternatives. */
  entries?: Record<string, string[]>;
}

export function createEngine(options?: EngineOptions): Engine;
export function convertWord(roman: string): Conversion;
export function convertText(text: string): string;
