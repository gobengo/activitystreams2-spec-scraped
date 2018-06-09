import cheerio from 'cheerio';
import fetch from 'node-fetch';

import {CheerioStatic} from './types';

export const vocabularySpecUrl =
    'https://www.w3.org/TR/activitystreams-vocabulary/';
const vocabularySelectors = {
  activityTypes: ($: CheerioStatic) =>
      $('#h-activity-types ~ table dfn')
          .map((i, activityTypeNameEl: CheerioElement) => {
            return {name: $(activityTypeNameEl).text()};
          })
          .get()
};

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

async function fetchHtml(url = vocabularySpecUrl) {
  const vocabResponse = await fetch(vocabularySpecUrl);
  const vocabHtml = await vocabResponse.text();
  return vocabHtml;
}

export async function scrapeVocabulary() {
  const $vocab = cheerio.load(await fetchHtml(vocabularySpecUrl));
  return Array.from(Object.entries(vocabularySelectors))
      .reduce((scraped, [key, select]) => {
        return Object.assign({}, scraped, {[key]: select($vocab)});
      }, {});
}

async function main() {
  const html = await scrapeVocabulary();
  console.log(html);
}
