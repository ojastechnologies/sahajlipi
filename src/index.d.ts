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
  /** Digit style for ASCII digits in ordinary text and candidate outputs. Default: "devanagari".
   * Protected addresses stay literal, and existing Devanagari digits are unchanged.
   */
  digits?: 'devanagari' | 'latin';
  /** Preserve recognizable URL and ASCII email spans in convertText. Default: true. */
  preserveTechnicalText?: boolean;
}

export function createEngine(options?: EngineOptions): Engine;
export function convertWord(roman: string): Conversion;
export function convertText(text: string): string;
