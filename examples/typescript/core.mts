import { convertText, convertWord, createEngine } from 'sahajlipi';
import type { Conversion, Engine, EngineOptions } from 'sahajlipi';

const options: EngineOptions = {
  digits: 'latin',
  entries: { myname: ['मेरोनाम'] },
};
const engine: Engine = createEngine(options);
const word: Conversion = convertWord('paani');
const sentence: string = convertText('pani 123|');
const customSentence: string = engine.convertText('myname 123|');

console.log(word.text); // पानी
console.log(sentence); // पनि १२३।
console.log(customSentence); // मेरोनाम 123।
