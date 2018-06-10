import assert from 'assert';

import {scrapeVocabulary, vocabularySpecUrl} from '.';

export const test = async () => {
  // This will load from a fixture and *will not* make an http request
  const vocab = await scrapeVocabulary();

  // Provide a URL to fetch the html from there, then parse
  // await scrapeVocabulary(vocabularySpecUrl);

  assert.equal(vocab.activityTypes.length, 28);
  assert(vocab.properties.length > 0);
};

if (require.main === module) {
  test().catch(e => console.error(e) && process.exit(1));
}
