// A shape-based text policy, shared by bulk conversion and the DOM adapter.
// No host lookup or URL validation is performed. Offsets use JavaScript UTF-16.
const startPattern = /https?:\/\/|mailto:|[A-Za-z0-9_%+-][A-Za-z0-9_%+@.-]*/gi;
const addressCharacter = /[A-Za-z0-9_%+@.-]/;
const hostCharacter = /[A-Za-z0-9.-]/;
const blockedBoundary = /[A-Za-z0-9_%+@.-]/;
const suffixBoundary = /[\s"'<>`«»“”‘’]/u;
const sentencePunctuation = /[.,!?;:]/;

function validLabels(host) {
  if (!host || host.length > 253) return false;
  return host.split('.').every((label) => label.length <= 63
    && /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(label));
}

function domainShape(host) {
  if (!validLabels(host)) return false;
  const labels = host.split('.');
  const last = labels[labels.length - 1];
  return labels.length > 1 && (/^[A-Za-z]{2,}$/.test(last)
    || /^xn--[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/i.test(last));
}

function emailShape(address) {
  const at = address.indexOf('@');
  if (at <= 0 || at !== address.lastIndexOf('@')) return false;
  const local = address.slice(0, at);
  return local.split('.').every((part) => /^[A-Za-z0-9_%+-]+$/.test(part))
    && domainShape(address.slice(at + 1));
}

function readRun(text, start, character) {
  let end = start;
  while (end < text.length && character.test(text[end])) end += 1;
  // A final period is sentence punctuation rather than a root-label marker.
  while (end > start && text[end - 1] === '.') end -= 1;
  return end;
}

function trimSuffix(text, start, end) {
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const balance = { '(': 0, '[': 0, '{': 0 };
  for (let index = start; index < end; index += 1) {
    const character = text[index];
    if (Object.hasOwn(balance, character)) balance[character] += 1;
    else if (Object.hasOwn(pairs, character)) balance[pairs[character]] -= 1;
  }
  while (end > start) {
    const last = text[end - 1];
    if (sentencePunctuation.test(last)) end -= 1;
    else if (Object.hasOwn(pairs, last) && balance[pairs[last]] < 0) {
      balance[pairs[last]] += 1;
      end -= 1;
    } else break;
  }
  return end;
}

function authorityHostStart(text, start) {
  let end = start;
  while (end < text.length && /[!-~]/.test(text[end])
    && !suffixBoundary.test(text[end]) && !/[/?#]/.test(text[end])) end += 1;
  const authority = text.slice(start, end);
  const at = authority.indexOf('@');
  // Userinfo is only inferred within an explicit HTTP(S) authority. A single
  // separator and printable ASCII credentials preserve their exact spelling.
  if (at < 0) return start;
  if (at === 0 || at !== authority.lastIndexOf('@')) return null;
  return start + at + 1;
}

function extendUrl(text, start, end) {
  if (text[end] === ':') {
    let portEnd = end + 1;
    while (portEnd < text.length && /[0-9]/.test(text[portEnd])) portEnd += 1;
    if (portEnd > end + 1) end = portEnd;
  }
  if (/[/?#]/.test(text[end] ?? '')) {
    while (end < text.length && !suffixBoundary.test(text[end])) end += 1;
  }
  return trimSuffix(text, start, end);
}

/** Find recognizable technical spans without changing or validating their text. */
export function findProtectedSpans(text) {
  const spans = [];
  // Keep each invocation independent, including calls from multiple engines.
  const candidates = new RegExp(startPattern.source, startPattern.flags);
  for (let match; (match = candidates.exec(text));) {
    const start = match.index;
    if (start > 0 && blockedBoundary.test(text[start - 1])) continue;
    const prefix = match[0].toLowerCase();
    let end;
    if (prefix === 'http://' || prefix === 'https://') {
      const hostStart = authorityHostStart(text, start + match[0].length);
      if (hostStart === null) continue;
      if (text[hostStart] === '[') {
        let close = hostStart + 1;
        while (close < text.length && /[0-9A-Fa-f:.]/.test(text[close])) close += 1;
        if (close === hostStart + 1 || text[close] !== ']') continue;
        end = close + 1;
      } else {
        end = readRun(text, hostStart, hostCharacter);
        if (!validLabels(text.slice(hostStart, end)) || /[_%+@-]/.test(text[end] ?? '')) continue;
      }
      end = extendUrl(text, start, end);
    } else {
      const addressStart = prefix === 'mailto:' ? start + match[0].length : start;
      end = readRun(text, addressStart, addressCharacter);
      const address = text.slice(addressStart, end);
      if (emailShape(address)) {
        // A plain email ends at its address; mailto URLs may have a query.
        if (prefix === 'mailto:' && text[end] === '?') end = extendUrl(text, start, end);
      } else if (prefix !== 'mailto:' && domainShape(address)) {
        end = extendUrl(text, start, end);
      } else continue;
    }
    spans.push({ start, end });
    candidates.lastIndex = end;
  }
  return spans;
}
