import assert from 'assert';
import cheerio from 'cheerio';
import {readFileSync} from 'fs';
import fetch from 'node-fetch';
import * as path from 'path';
import {relative} from 'path';
import {Readable} from 'stream';
import * as url from 'url';

import {cli} from './cli';
import {scrapedVocabularyJsonldContext} from './jsonld/context';
import * as selectors from './selectors';
import {AS2CoreOntology, Link, Ontology as IOntology, OwlClassUnion, ParsedClass, Property, RDFList, ScrapedVocabulary,} from './types';

export const as2NsUrl = 'https://www.w3.org/ns/activitystreams#';
export const as2ContextUrl = 'https://www.w3.org/ns/activitystreams';
export const vocabularySpecUrl =
    'https://www.w3.org/TR/activitystreams-vocabulary/';
export const coreSpecUrl = 'https://www.w3.org/TR/activitystreams-core/';

const fetchHtml = async (url: string) => {
  const response = await fetch(url);
  const responseText = await response.text();
  return responseText;
};

const readFixture = (filename: string) =>
    readFileSync(require.resolve(filename)).toString();

/**
 * Scrape the ActivityStreams 2.0 Vocabulary and return the types + metadata
 * @param [url] - url of vocab document. If not provided, a fixture will be used
 * and you won't have up-to-date data
 */
export async function scrapeVocabulary(url?: string):
    Promise<ScrapedVocabulary> {
  const html = await (
      url ? fetchHtml(url) :
            readFixture(path.join(
                __dirname,
                '../data/activitystreams-vocabulary/1528589057.html')));
  const parsed = parseVocabulary(html, url || vocabularySpecUrl);
  return parsed;
}

const applyBaseUrlToLink = (baseUrl: string, link: Link) =>
    link && Object.assign({}, link, {href: withBaseUrl(baseUrl, link.href)});

// If provided relativeUrl is not absolute, resolve it relative to baseUrl
const withBaseUrl = (baseUrl: string, relativeUrl: string) => {
  return relativeUrl && url.resolve(baseUrl, relativeUrl);
};

const applyBaseUrlToOwlClassUnion =
    (baseUrl: string, dt: OwlClassUnion): OwlClassUnion => {
      return Object.assign({}, dt, {
        unionOf: dt.unionOf.map((dt2 => {
          if (typeof dt2 === 'string') {
            return withBaseUrl(baseUrl, dt2);
          }
          return applyBaseUrlToLink(baseUrl, dt2);
        }))
      });
    };

const parseClassElement =
    ($: CheerioSelector, el: CheerioElement, baseUrl: string) => {
      const $el = $(el);
      return {
        type: 'owl:Class',
        name: selectors.name($, $el),
        notes: selectors.notes($, $el),
        disjointWith: (selectors.disjoinWith($, $el) ||
                       []).map(l => applyBaseUrlToLink(baseUrl, l)),
        subClassOf: selectors.activityTypeSubClassOf($, $el, baseUrl),
        id: withBaseUrl(baseUrl, selectors.id($, $el)),
        url: withBaseUrl(baseUrl, selectors.url($, $el)),
        example: selectors.example($, $el, baseUrl),
      };
    };

const parseProperty =
    ($: CheerioSelector, el: CheerioElement, baseUrl: string) => {
      const $el = $(el);
      const domain = selectors.domain($, $el);
      return {
        type: selectors.propertyTypes($, $el),
        name: selectors.name($, $el),
        id: withBaseUrl(baseUrl, selectors.id($, $el)),
        url: withBaseUrl(baseUrl, selectors.url($, $el)),
        isDefinedBy: withBaseUrl(baseUrl, selectors.url($, $el)),
        // @todo (bengo.is) rename selector to not mention activity vs property
        notes: selectors.notes($, $el),
        example: selectors.example($, $el, baseUrl),
        domain: applyBaseUrlToOwlClassUnion(baseUrl, domain),
        range: applyBaseUrlToOwlClassUnion(baseUrl, selectors.range($, $el)),
        subPropertyOf:
            applyBaseUrlToLink(baseUrl, selectors.subPropertyOf($, $el)),
      };
    };

class Ontology<Member> implements IOntology<Member> {
  '@context' = {
    owl: 'http://www.w3.org/2002/07/owl#' as 'http://www.w3.org/2002/07/owl#',
    members: 'owl:members' as 'owl:members'
  };
  type: 'owl:Ontology' = 'owl:Ontology';
  members: RDFList<Member>;
  constructor({members}: {members: RDFList<Member>}) {
    this.members = members;
  }
}

const parseClassTable = ($: CheerioStatic, $el: Cheerio, baseUrl: string) =>
    $el.toArray().map(el => parseClassElement($, el, baseUrl));

/**
 * Parse html of an AS2 Vocabulary Document
 * @param html - ActivityStreams 2.0 Vocabulary document
 */
export const parseVocabulary = (html: string, baseUrl = '') => {
  const $ = cheerio.load(html);
  const parsedVocab = {
    '@context': scrapedVocabularyJsonldContext,
    '@id': 'https://www.w3.org/TR/activitystreams-vocabulary/',
    type: 'http://www.w3.org/2002/07/owl#Ontology',
    sections: {
      coreTypes: new Ontology<ParsedClass>({
        members: parseClassTable($, $('#h-types ~ table > tbody'), baseUrl)
      }),
      activityTypes: new Ontology<ParsedClass>({
        members:
            parseClassTable($, $('#h-activity-types ~ table > tbody'), baseUrl)
      }),
      actorTypes: new Ontology<ParsedClass>({
        members:
            parseClassTable($, $('#h-actor-types ~ table > tbody'), baseUrl)
      }),
      objectTypes: new Ontology<ParsedClass>({
        members:
            parseClassTable($, $('#h-object-types ~ table > tbody'), baseUrl)
      }),
      properties: new Ontology<Property>({
        members: $('#h-properties ~ table > tbody')
                     .toArray()
                     .map(el => parseProperty($, el, baseUrl))
      })
    },
  };
  return parsedVocab;
};

if (require.main === module) {
  cli();
}
