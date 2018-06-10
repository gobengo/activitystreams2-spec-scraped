/**
 * @file Functions that will select different bits of metadata from the HTML
 * Elements documenting each Activity Type
 */
import assert from 'assert';
import * as url from 'url';

/**
 * Clean up HTML we scraped. e.g. indented HTML will have lots of extra
 * whitespace we want to collapse.
 * @param rawHtml - html to clean
 */
const cleanHtml = (rawHtml: string) => rawHtml.trim().replace(/\s\s+/g, ' ');

export const subClassOf =
    ($: CheerioSelector, $el: Cheerio, baseUrl: string) => {
      const [$extendsLabel, $extends] =
          $el.find('> tr:nth-child(3) > td').toArray().map($);
      assert.equal(
          $extendsLabel.text(), 'Extends:',
          `Failed to find 'Extends:' label when parsing Acitivty Type ${
              name($, $el)}`);
      const subClassOfName = $extends.find('code').text();
      assert(
          subClassOfName,
          `Failed to find name of Activity Type that ${name} extends`);
      const extendsHref = $extends.find('a').attr('href');
      const extendsAbsoluteUrl =
          extendsHref && url.resolve(baseUrl, extendsHref);
      const subClassOf = {
        name: subClassOfName,
        ...extendsAbsoluteUrl &&
            {
              href: extendsAbsoluteUrl
            }
      };
      return subClassOf;
    };

export const name = ($: CheerioSelector, $el: Cheerio) => {
  const name = $el.find('> tr:first-child > td:first-child dfn').text();
  return name;
};

export const notes = ($: CheerioSelector, $el: Cheerio) => {
  const [notesLabel, notes] = $el.find('> tr:nth-child(2) > td')
                                  .toArray()
                                  .slice(0, 2)
                                  .map(n => $(n).text())
                                  .map(cleanHtml);
  assert.equal(
      notesLabel, 'Notes:',
      `Expected notes label of 'Notes:' when parsing Acitivty Type ${
          name($, $el)}, but got ${notesLabel}`);
  return notes;
};

export const uri = ($: CheerioSelector, $el: Cheerio) => {
  const uriLabel = $el.find('> tr:first-child > td:nth-child(2)').text();
  assert.equal(
      uriLabel, 'URI:',
      `Expected uriLabel of 'URI:' when parsing Activity Type ${
          name($, $el)}, but got ${uriLabel}`);
  const uri = $el.find('> tr:first-child > td:nth-child(3)').text();
  return uri;
};
