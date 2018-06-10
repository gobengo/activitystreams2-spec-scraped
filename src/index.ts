import assert from 'assert';
import cheerio from 'cheerio';
import {readFileSync} from 'fs';
import fetch from 'node-fetch';
import {relative} from 'path';
import * as url from 'url';

import * as selectors from './selectors';
import {ASType, ScrapedVocabulary} from './types';

export const vocabularySpecUrl =
    'https://www.w3.org/TR/activitystreams-vocabulary/';

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

/**
 * Parse html of an AS2 Vocabulary Document
 * @param html - ActivityStreams 2.0 Vocabulary document
 */
export const parseVocabulary = (html: string, baseUrl = '') => {
  const $ = cheerio.load(html);
  // If provided relativeUrl is not absolute, resolve it relative to baseUrl
  const withBaseUrl = (baseUrl: string, relativeUrl: string) => {
    return relativeUrl && url.resolve(baseUrl, relativeUrl);
  };
  const activityTypes =
      $('#h-activity-types ~ table > tbody').toArray().map((el) => {
        const $el = $(el);
        return {
          name: selectors.name($, $el),
          notes: selectors.notes($, $el),
          subClassOf: selectors.subClassOf($, $el, baseUrl),
          id: withBaseUrl(baseUrl, selectors.id($, $el)),
          url: withBaseUrl(baseUrl, selectors.url($, $el)),
          example: selectors.example($, $el, baseUrl),
        };
      });
  const applyBaseUrlToASType = (baseUrl: string, t: ASType) =>
      Object.assign({}, t, {url: withBaseUrl(baseUrl, t.url)});
  const properties = $('#h-properties ~ table > tbody').toArray().map((el) => {
    const $el = $(el);
    return {
      name: selectors.name($, $el),
      id: withBaseUrl(baseUrl, selectors.id($, $el)),
      url: withBaseUrl(baseUrl, selectors.url($, $el)),
      // @todo (bengo.is) rename selector to not mention activity vs property
      notes: selectors.notes($, $el),
      example: selectors.example($, $el, baseUrl),
      domain:
          selectors.domain($, $el).map(d => applyBaseUrlToASType(baseUrl, d)),
      range: selectors.range($, $el).map(d => applyBaseUrlToASType(baseUrl, d)),
      functional: selectors.functional($, $el),
    };
  });
  return {
    activityTypes,
    properties,
  };
};

async function main() {
  const html = await scrapeVocabulary();
  console.log(JSON.stringify(html, null, 2));
}

if (require.main === module) {
  main()
      .then((d) => {
        process.exit();
      })
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
}
