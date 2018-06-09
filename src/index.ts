import assert from 'assert';
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import * as url from 'url';

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

export interface ActivityType {
  name: string;
  notes: string;
  extends: {name: string; href?: string;};
}

export interface ScrapedVocabulary {
  activityTypes: ActivityType[];
}

/**
 * Clean up HTML we scraped. e.g. indented HTML will have lots of extra
 * whitespace we want to collapse.
 * @param rawHtml - html to clean
 */
const cleanHtml = (rawHtml: string) => rawHtml.trim().replace(/\s\s+/g, ' ');

export async function scrapeVocabulary(): Promise<ScrapedVocabulary> {
  const $ = cheerio.load(await fetchHtml(vocabularySpecUrl));
  const activityTypes =
      $('#h-activity-types ~ table > tbody').toArray().map((el) => {
        const $el = $(el);
        // Activity Type Name
        const name = $el.find('> tr:first-child > td:first-child dfn').text();
        const uriLabel = $el.find('> tr:first-child > td:nth-child(2)').text();
        assert.equal(
            uriLabel, 'URI:',
            `Expected uriLabel of 'URI:' when parsing Activity Type ${
                name}, but got ${uriLabel}`);
        const uri = $el.find('> tr:first-child > td:nth-child(3)').text();
        // Activity Type Notes
        const [notesLabel, notes] = $el.find('> tr:nth-child(2) > td')
                                        .toArray()
                                        .slice(0, 2)
                                        .map(n => $(n).text())
                                        .map(cleanHtml);
        assert.equal(
            notesLabel, 'Notes:',
            `Expected notes label of 'Notes:' when parsing Acitivty Type ${
                name}, but got ${notesLabel}`);
        // Activity Type Parent Type (Extends)
        const [$extendsLabel, $extends] =
            $el.find('> tr:nth-child(3) > td').toArray().map($);
        assert.equal(
            $extendsLabel.text(), 'Extends:',
            `Failed to find 'Extends:' label when parsing Acitivty Type ${
                name}`);
        const extendsName = $extends.find('code').text();
        assert(
            extendsName,
            `Failed to find name of Activity Type that ${name} extends`);
        const extendsHref = $extends.find('a').attr('href');
        const extendsAbsoluteUrl =
            extendsHref && url.resolve(vocabularySpecUrl, extendsHref);
        return {
          name,
          notes,
          extends: {
            name: extendsName,
            ...extendsAbsoluteUrl &&
                {
                  href: extendsAbsoluteUrl
                }
          }
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
