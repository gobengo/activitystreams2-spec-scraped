import assert from 'assert';
import cheerio from 'cheerio';
import {readFileSync} from 'fs';
import fetch from 'node-fetch';
import {relative} from 'path';
import {Readable} from 'stream';
import * as url from 'url';

import {cli} from './cli';
import * as selectors from './selectors';
import {DataType, Link, Property, ScrapedVocabulary} from './types';

export const vocabularySpecUrl =
    'https://www.w3.org/TR/activitystreams-vocabulary/';
export const jsonldContext = [
  'https://www.w3.org/ns/activitystreams', {
    'owl': 'http://www.w3.org/2002/07/owl#',
    'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
    'schema': 'http://schema.org/',
    'xsd': 'http://www.w3.org/2001/XMLSchema#',
    'subClassOf': 'rdfs:subClassof',
    'subPropertyOf': 'rdfs:subPropertyof',
    'domain': 'rdfs:domain',
    'range': 'rdfs:range',
    'notes': 'rdfs:comment',
    'isDefinedBy': 'rdfs:isDefinedBy',
    'unionOf': 'owl:unionOf',
    'value': 'rdf:value',
    'example': 'schema:workExample',
    'mainEntity': 'schema:mainEntity',
  }
];

/**
 * Scrape the ActivityStreams 2.0 Vocabulary and return the types + metadata
 * @param [url] - url of vocab document. If not provided, a fixture will be used
 * and you won't have up-to-date data
 */
export async function scrapeVocabulary(url?: string):
    Promise<ScrapedVocabulary> {
  const fetchHtml = async (url = vocabularySpecUrl) => {
    const vocabResponse = await fetch(vocabularySpecUrl);
    const vocabHtml = await vocabResponse.text();
    return vocabHtml;
  };
  const readFixture =
      (f = '../data/activitystreams-vocabulary/1528589057.html') =>
          readFileSync(require.resolve(f)).toString();
  const html = await (url ? fetchHtml(url) : readFixture());
  const parsed = parseVocabulary(html, url || vocabularySpecUrl);
  return parsed;
}

const applyBaseUrlToLink = (baseUrl: string, link: Link) =>
    link && Object.assign({}, link, {href: withBaseUrl(baseUrl, link.href)});

// If provided relativeUrl is not absolute, resolve it relative to baseUrl
const withBaseUrl = (baseUrl: string, relativeUrl: string) => {
  return relativeUrl && url.resolve(baseUrl, relativeUrl);
};

const applyBaseUrlToDataType = (baseUrl: string, dt: DataType): DataType => {
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
        domain: applyBaseUrlToDataType(baseUrl, domain),
        range: applyBaseUrlToDataType(baseUrl, selectors.range($, $el)),
        subPropertyOf:
            applyBaseUrlToLink(baseUrl, selectors.subPropertyOf($, $el)),
      };
    };

/**
 * Parse html of an AS2 Vocabulary Document
 * @param html - ActivityStreams 2.0 Vocabulary document
 */
export const parseVocabulary = (html: string, baseUrl = '') => {
  const $ = cheerio.load(html);
  const parseClassTable = ($el: Cheerio) =>
      $el.toArray().map(el => parseClassElement($, el, baseUrl));
  return {
    '@context': jsonldContext,
    activityTypes: parseClassTable($('#h-activity-types ~ table > tbody')),
    actorTypes: parseClassTable($('#h-actor-types ~ table > tbody')),
    objectTypes: parseClassTable($('#h-object-types ~ table > tbody')),
    properties: $('#h-properties ~ table > tbody')
                    .toArray()
                    .map(el => parseProperty($, el, baseUrl)),
  };
};

if (require.main === module) {
  cli();
}
