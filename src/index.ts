import cheerio from 'cheerio';
import fetch from 'node-fetch';

export const vocabularySpecUrl =
    'https://www.w3.org/TR/activitystreams-vocabulary/';

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

interface ActivityType {
  name: string;
}

interface ScrapedVocabulary {
  activityTypes: ActivityType[];
}

export async function scrapeVocabulary(): Promise<ScrapedVocabulary> {
  const $ = cheerio.load(await fetchHtml(vocabularySpecUrl));
  return {
    activityTypes: $('#h-activity-types ~ table dfn')
                       .map(
                           (i, activityTypeNameEl: CheerioElement):
                               ActivityType => {
                                 return {name: $(activityTypeNameEl).text()};
                               })
                       .toArray()
  };
}

async function main() {
  const html = await scrapeVocabulary();
  console.log(html);
}
