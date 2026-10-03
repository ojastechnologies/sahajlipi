import { convertText, convertWord, createEngine } from 'sahajlipi';
import type { Conversion, Engine, EngineOptions } from 'sahajlipi';

const options: EngineOptions = {
  consonantMode: 'full',
  digits: 'latin',
  preserveTechnicalText: true,
  entries: { ojas: ['ओजस', 'ओजस्'] },
};
const engine: Engine = createEngine(options);
const result: Conversion = engine.convertWord('ojas');
const text: string = convertText('paani 123');
const alternatives: string[] = convertWord('cha').candidates;
const ambiguous: boolean = result.ambiguous;
void [text, alternatives, ambiguous];
const strict: Engine = createEngine({ consonantMode: 'half' });
const half: string = strict.convertText('k kr');
void half;

// @ts-expect-error Only the two documented consonant modes are supported.
createEngine({ consonantMode: 'strict' });
// @ts-expect-error Only the two documented digit styles are supported.
createEngine({ digits: 'arabic' });
// @ts-expect-error Technical text preservation is a boolean.
createEngine({ preserveTechnicalText: 'yes' });
// @ts-expect-error Entries are arrays of candidate strings.
createEngine({ entries: { camera: 'क्यामेरा' } });
// @ts-expect-error Unsupported language profiles must not silently type-check.
createEngine({ language: 'hindi' });
// @ts-expect-error Conversion input is a string.
engine.convertText(123);
// @ts-expect-error Candidate output is an array, not a selected string.
const candidate: string = result.candidates;
void candidate;
