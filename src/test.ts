import assert from 'assert';

import {scrapeVocabulary, vocabularySpecUrl} from '.';
import {ScrapedVocabulary} from './types';

const {promises: jsonld} = require('jsonld');

type IRI = string;
interface LDObject {
  '@id': IRI;
  '@type': IRI;
}

const testJsonLd = async (vocab: ScrapedVocabulary) => {
  console.log('testJsonld');
  const expanded = await jsonld.expand(vocab);
  const flattened = await jsonld.flatten(vocab);
  const bNodes = flattened.filter((n: LDObject) => n['@id'].startsWith('_:'));
  const nodesNoType = flattened.filter((n: LDObject) => !n['@type']);
  // @todo (bengo.is) actually we want this to be 0, but the last two are
  // actually from some examples in the vocabulary itself
  assert.equal(
      nodesNoType.length, 2, 'all nodes in output JSON-LD should have a type');
};

export const test = async () => {
  // This will load from a fixture and *will not* make an http request
  const vocab = await scrapeVocabulary();

  // Provide a URL to fetch the html from there, then parse
  // await scrapeVocabulary(vocabularySpecUrl);

  assert.equal(vocab.activityTypes.members.length, 28);
  assert.equal(vocab.actorTypes.members.length, 5);
  assert.equal(vocab.objectTypes.members.length, 13);
  assert.equal(vocab.properties.members.length, 62);

  await testJsonLd(vocab);
};

if (require.main === module) {
  test().catch(e => console.error(e) && process.exit(1));
}
