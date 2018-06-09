import assert from 'assert';
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import * as url from 'url';
import * as activityTypeSelectors from './activityTypeSelectors';
import {ScrapedVocabulary} from './types';

export const vocabularySpecUrl =
    'https://www.w3.org/TR/activitystreams-vocabulary/';

/**
 * Scrape the ActivityStreams 2.0 Vocabulary and return the types + metadata
 */
export async function scrapeVocabulary(url = vocabularySpecUrl):
    Promise<ScrapedVocabulary> {
  const fetchHtml = async (url = vocabularySpecUrl) => {
    const vocabResponse = await fetch(vocabularySpecUrl);
    const vocabHtml = await vocabResponse.text();
    return vocabHtml;
  };
  const $ = cheerio.load(await fetchHtml(vocabularySpecUrl));
  const activityTypes =
      $('#h-activity-types ~ table > tbody').toArray().map((el) => {
        const $el = $(el);
        return {
          name: activityTypeSelectors.name($, $el),
          notes: activityTypeSelectors.notes($, $el),
          subClassOf:
              activityTypeSelectors.subClassOf($, $el, vocabularySpecUrl),
          uri: activityTypeSelectors.uri($, $el),
        };
      });
  return {
    activityTypes,
  };
}

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
