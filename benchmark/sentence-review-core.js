export function buildSentenceReviewQueue(payload) {
  if (!payload || !Array.isArray(payload.data)) {
    throw new Error('Expected a Bhasha-Abhijnaanam object with a data array');
  }

  const ids = new Set();
  const queue = [];
  for (const item of payload.data) {
    if (item?.language !== 'Nepali' ||
        typeof item['romanized sentence'] !== 'string' || !item['romanized sentence'].trim() ||
        typeof item['native sentence'] !== 'string' || !item['native sentence'].trim()) {
      continue;
    }
    const sourceId = item.unique_identifier;
    if (typeof sourceId !== 'string' || !/^ne_\d+$/.test(sourceId) ||
        item.source !== 'Manually-Collected') {
      throw new Error(`Unexpected Nepali sentence source or identifier: ${sourceId}`);
    }
    if (ids.has(sourceId)) throw new Error(`Nepali sentence has repeated identifier ${sourceId}`);
    ids.add(sourceId);
    queue.push({
      sourceId,
      roman: item['romanized sentence'],
      proposedOutput: item['native sentence'],
      provenance: 'ai4bharat/Bhasha-Abhijnaanam@c54a95d9b9d62c891a03bd5da60715df7176b097',
      reviewStatus: 'unreviewed',
      reviews: [],
      acceptedOutputs: [],
    });
  }
  if (!queue.length) throw new Error('No paired Nepali sentences found');
  return queue;
}
