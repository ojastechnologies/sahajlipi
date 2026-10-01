// Bounded joined-form preferences, reviewed in docs/package/loanword-suffixes-2026-10-01.md.
// These explicit keys exclude native Nepali entries, month names and arbitrary custom stems.
const stems = [
  'ambulance', 'bank', 'battery', 'bus', 'camera', 'car', 'carpet', 'charger', 'cheque',
  'college', 'company', 'computer', 'connector', 'courier', 'cricket', 'digital', 'doctor',
  'drone', 'email', 'file', 'football', 'furniture', 'hotel', 'internet', 'inverter', 'keyboard',
  'laptop', 'media', 'microphone', 'mobile', 'motorcycle', 'mouse', 'nurse', 'office', 'password',
  'phone', 'printer', 'radio', 'restaurant', 'router', 'scanner', 'school', 'sofa', 'software',
  'taxi', 'telephone', 'ticket', 'van', 'video', 'website', 'wifi',
];

// Complete endings only: singular/postposition, plural, or plural + one postposition.
// Joining keeps the entire native root; this is not a general morphological parser.
const suffixes = {
  ma: 'मा', ko: 'को', ka: 'का', ki: 'की', le: 'ले', lai: 'लाई',
  bata: 'बाट', sanga: 'सँग', mathi: 'माथि', haru: 'हरू',
  haruma: 'हरूमा', haruko: 'हरूको', haruka: 'हरूका', haruki: 'हरूकी',
  harule: 'हरूले', harulai: 'हरूलाई', harubata: 'हरूबाट',
  harusanga: 'हरूसँग', harumathi: 'हरूमाथि',
};

export function loanwordReadings(normalized, dictionary) {
  for (const stem of stems) {
    if (!normalized.startsWith(stem)) continue;
    const ending = normalized.slice(stem.length);
    if (!Object.hasOwn(suffixes, ending)) continue;
    return dictionary.get(stem).map(reading =>
      reading + (/^[A-Za-z]+$/.test(reading) ? ending : suffixes[ending]));
  }
  return undefined;
}
