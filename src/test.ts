import assert from 'assert';

import {scrapeVocabulary, vocabularySpecUrl} from '.';
import {defaultJsonldOptions} from './jsonld';
import {easyForJavaScriptJsonldContext} from './jsonld/context';
import {ScrapedVocabulary} from './types';

const {promises: jsonld} = require('jsonld');

type IRI = string;
interface LDObject {
  '@id': IRI;
  '@type': IRI;
}

const owl = {
  imports: 'http://www.w3.org/2002/07/owl#imports',
  Ontology: 'http://www.w3.org/2002/07/owl#Ontology'
};

const testJsonLd = async (vocab: ScrapedVocabulary) => {
  const expanded = await jsonld.expand(vocab, defaultJsonldOptions);
  const flattened = await jsonld.flatten(vocab, null, defaultJsonldOptions);
  const bNodes = flattened.filter((n: LDObject) => n['@id'].startsWith('_:'));
  const nodesNoType = flattened.filter((n: LDObject) => !n['@type']);
  const ontologiesFramed =
      await jsonld.frame(vocab, {'@type': owl.Ontology}, defaultJsonldOptions);
  const ontologies = ontologiesFramed['@graph'];
  assert.equal(
      ontologies.length, 5,
      'there are five total ontologies 1 + 4 subsections');
  const as2VocabularyUrl = 'https://www.w3.org/TR/activitystreams-vocabulary/';
  const mainOntologyFramed = await jsonld.frame(
      vocab, {
        '@id': as2VocabularyUrl,
      },
      defaultJsonldOptions);
  assert.equal(mainOntologyFramed['@graph'].length, 1);
  // Get rid of ["@graph"][], but assign @context to it
  const mainOntology = Object.assign(
      {}, mainOntologyFramed['@graph'][0],
      {'@context': mainOntologyFramed['@context']});
  assert.equal(
      mainOntology[owl.imports].length, 4,
      'Whole AS2 Ontology imports 4 subparts');
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

  assert.equal(vocab.sections.activityTypes.members.length, 28);
  assert.equal(vocab.sections.actorTypes.members.length, 5);
  assert.equal(vocab.sections.objectTypes.members.length, 13);
  assert.equal(vocab.sections.properties.members.length, 62);
  await testJsonLd(vocab);
};

if (require.main === module) {
  test().catch(e => console.error(e) && process.exit(1));
}
