// A shape-based text policy, shared by bulk conversion and the DOM adapter.
// No host lookup or URL validation is performed. Offsets use JavaScript UTF-16.
const startPattern = /https?:|mailto:|[A-Za-z0-9_%+-][A-Za-z0-9_%+@.-]*/gi;
const addressCharacter = /[A-Za-z0-9_%+@.-]/;
const blockedBoundary = /[A-Za-z0-9_%+@.-]/;
const suffixBoundary = /[\s"'<>`«»“”‘’]/u;
const sentencePunctuation = /[.,!?;:]/;

function domainShape(host) {
  if (!host || host.length > 253) return false;
  const labels = host.split('.');
  const last = labels.pop();
  // One alphabetic character after a dot is already an address cue. A final
  // label may still be in progress (for example camera.co- or camera.c1).
  return labels.length > 0 && /^[A-Za-z][A-Za-z0-9-]*$/.test(last)
    && last.length <= 63 && labels.every((label) => label.length <= 63
      && /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(label));
}

function emailPrefix(address) {
  const at = address.indexOf('@');
  if (at <= 0 || at !== address.lastIndexOf('@')) return false;
  const local = address.slice(0, at);
  return local.split('.').every((part) => /^[A-Za-z0-9_%+-]+$/.test(part))
    && (address.slice(at + 1) === '' || /^[A-Za-z0-9][A-Za-z0-9.-]*$/.test(address.slice(at + 1)));
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

function readHttpPrefix(text, start, prefixEnd) {
  // A scheme is an explicit typing cue. Preserve unfinished slashes, host,
  // port and ordinary credentials without requiring a completed authority.
  let end = prefixEnd;
  for (let count = 0; count < 2 && text[end] === '/'; count += 1) end += 1;
  const authorityStart = end;
  let authorityEnd = end;
  while (authorityEnd < text.length && /[!-~]/.test(text[authorityEnd])
    && !suffixBoundary.test(text[authorityEnd]) && !/[/?#|]/.test(text[authorityEnd])) authorityEnd += 1;
  const authority = text.slice(authorityStart, authorityEnd);
  const at = authority.indexOf('@');
  // An explicit userinfo separator also preserves reserved ASCII credential
  // characters. Without it, commas and enclosing punctuation end the host.
  if (at > 0 && at === authority.lastIndexOf('@')) end = authorityStart + at + 1;
  if (text[end] === '[') {
    end += 1;
    while (end < text.length && /[0-9A-Fa-f:.]/.test(text[end])) end += 1;
    if (text[end] === ']') end += 1;
  }
  while (end < text.length && /[A-Za-z0-9._~%+@:-]/.test(text[end])) end += 1;
  if (/[/?#]/.test(text[end] ?? '')) return extendUrl(text, start, end);
  // The cue's colon belongs to the prefix even when it is the last character.
  return Math.max(prefixEnd, trimSuffix(text, start, end));
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
    if (prefix === 'http:' || prefix === 'https:') {
      end = readHttpPrefix(text, start, start + match[0].length);
    } else {
      const addressStart = prefix === 'mailto:' ? start + match[0].length : start;
      end = readRun(text, addressStart, addressCharacter);
      const address = text.slice(addressStart, end);
      if (emailPrefix(address)) {
        // An @ is a useful typing cue even with an empty or partial host.
        if (prefix === 'mailto:' && text[end] === '?') end = extendUrl(text, start, end);
      } else if (prefix !== 'mailto:' && prefix.startsWith('www.')) {
        // Unlike a generic trailing dot, www. explicitly signals a website.
        end = Math.max(start + 4, extendUrl(text, start, Math.max(start + 4, end)));
      } else if (prefix !== 'mailto:' && domainShape(address)) {
        end = extendUrl(text, start, end);
      } else continue;
    }
    spans.push({ start, end });
    candidates.lastIndex = end;
  }
  return spans;
}
