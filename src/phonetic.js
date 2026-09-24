const consonants = {
  ksh: 'क्ष', chh: 'छ',
  Th: 'ठ', Dh: 'ढ', Sh: 'ष',
  kh: 'ख', gh: 'घ', ch: 'च', jh: 'झ', th: 'थ', dh: 'ध',
  ph: 'फ', bh: 'भ', sh: 'श', ng: 'ङ', ny: 'ञ',
  nn: 'ण', gy: 'ज्ञ',
  T: 'ट', D: 'ड', S: 'ष',
  k: 'क', g: 'ग', c: 'च', j: 'ज', t: 'त', d: 'द', n: 'न',
  p: 'प', f: 'फ', b: 'ब', m: 'म', y: 'य', r: 'र', l: 'ल',
  v: 'व', w: 'व', s: 'स', h: 'ह',
};

const vowels = {
  aa: ['आ', 'ा'], ee: ['ई', 'ी'], ii: ['ई', 'ी'], oo: ['ऊ', 'ू'],
  uu: ['ऊ', 'ू'], ai: ['ऐ', 'ै'], au: ['औ', 'ौ'], R: ['ऋ', 'ृ'],
  a: ['अ', ''], i: ['इ', 'ि'], u: ['उ', 'ु'], e: ['ए', 'े'], o: ['ओ', 'ो'],
};

const consonantKeys = Object.keys(consonants).sort((a, b) => b.length - a.length);
const vowelKeys = Object.keys(vowels).sort((a, b) => b.length - a.length);

function matchToken(input, offset, keys) {
  return keys.find((key) => input.startsWith(key, offset));
}

// Shift+T/D/S/R select distinct sounds. Shift+H types visarga after a vowel.
// Other capitals remain incidental, so a title-cased initial H still types ह.
export function normalizeRoman(roman) {
  return roman.replace(/[A-Z]/g, (letter, offset) => {
    if (letter === 'T' || letter === 'D' || letter === 'S' || letter === 'R') return letter;
    if (letter === 'H' && /[aeiouAEIOUR]/.test(roman[offset - 1] ?? '')) return letter;
    return letter.toLowerCase();
  });
}

export function phoneticWord(roman) {
  const input = normalizeRoman(roman);
  let output = '';
  let previousIsConsonant = false;

  for (let offset = 0; offset < input.length;) {
    if (input[offset] === 'H') {
      output += 'ः';
      previousIsConsonant = false;
      offset++;
      continue;
    }

    const consonant = matchToken(input, offset, consonantKeys);
    if (consonant) {
      output += consonants[consonant] + '्';
      previousIsConsonant = true;
      offset += consonant.length;
      continue;
    }

    const vowel = matchToken(input, offset, vowelKeys);
    if (vowel) {
      if (previousIsConsonant) {
        output = output.slice(0, -1) + vowels[vowel][1];
      } else {
        output += vowels[vowel][0];
      }
      previousIsConsonant = false;
      offset += vowel.length;
      continue;
    }

    output += roman[offset];
    previousIsConsonant = false;
    offset += 1;
  }

  return output;
}
