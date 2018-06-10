import assert from 'assert';
import cheerio from 'cheerio';
import {readFileSync} from 'fs';
import fetch from 'node-fetch';
import * as url from 'url';

import * as activityTypeSelectors from './activityTypeSelectors';
import {ScrapedVocabulary} from './types';

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
  const parsed = parseVocabulary(html);
  return parsed;
}

/**
 * Parse html of an AS2 Vocabulary Document
 * @param html - ActivityStreams 2.0 Vocabulary document
 */
export const parseVocabulary = (html: string) => {
  const $ = cheerio.load(html);
  const activityTypes =
      $('#h-activity-types ~ table > tbody').toArray().map((el) => {
        const $el = $(el);
        return {
          name: activityTypeSelectors.name($, $el),
          notes: activityTypeSelectors.notes($, $el),
          subClassOf:
              activityTypeSelectors.subClassOf($, $el, vocabularySpecUrl),
          uri: activityTypeSelectors.uri($, $el),
          example: activityTypeSelectors.example($, $el, vocabularySpecUrl),
        };
      });
  return {
    activityTypes,
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
