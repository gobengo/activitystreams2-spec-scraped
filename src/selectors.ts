/**
 * @file Functions that will select different bits of metadata from the HTML
 * Elements documenting each Activity Vocabulary item (e.g. Activity Type,
 * Property)
 */
import assert from 'assert';
import * as urlm from 'url';
import {ASType} from './types';

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
          `Failed to find 'Extends:' label when parsing ${name($, $el)}`);
      const subClassOfName = $extends.find('code').text();
      assert(subClassOfName, `Failed to find subClassOf for ${name}`);
      const extendsHref = $extends.find('a').attr('href');
      const extendsAbsoluteUrl =
          extendsHref && urlm.resolve(baseUrl, extendsHref);
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
      `Expected notes label of 'Notes:' when parsing ${name($, $el)}, but got ${
          notesLabel}`);
  return notes;
};

export const id = ($: CheerioSelector, $el: Cheerio) => {
  const uriLabel = $el.find('> tr:first-child > td:nth-child(2)').text();
  assert.equal(
      uriLabel, 'URI:',
      `Expected uriLabel of 'URI:' when parsing ${name($, $el)}, but got ${
          uriLabel}`);
  const id = $el.find('> tr:first-child > td:nth-child(3)').text();
  return id;
};


export const example = ($: CheerioSelector, $el: Cheerio, baseUrl: string) => {
  const examples = $el.find('> tr:nth-child(1) > td:nth-child(4) > *[id]')
                       .toArray()
                       .map((el) => {
                         const $example = $(el);
                         const domId = $example.attr('id');
                         const example = {
                           name: $example.find('.example-title').text(),
                           uri: domId && urlm.resolve(baseUrl, `#${domId}`),
                           object: JSON.parse($example.find('.json').text()),
                         };
                         return example;
                       });
  return examples;
};

export const url = ($: CheerioSelector, $el: Cheerio) => {
  const anchorName =
      $el.find('> tr:first-child > td:first-child dfn').attr('id');
  return `#${anchorName}`;
};

const makeASTypeSelector = (domQuery: string, expectedLabel: string) =>
    ($: CheerioSelector, $el: Cheerio): ASType[] => {
      const [labelElement, asTypeElement] =
          $el.find(domQuery).toArray().slice(0, 2);
      const rangeLabel = $(labelElement).text();
      assert.equal(
          rangeLabel, expectedLabel,
          `Expected rangeLabel of '${expectedLabel}' when parsing ${
              name($, $el)}, but got ${rangeLabel}`);
      const range =
          $(asTypeElement).find('code').toArray().map((rangeComponentEl) => {
            const $rangeComponentEl = $(rangeComponentEl);
            const href = $rangeComponentEl.find('a').attr('href');
            return {
              name: $rangeComponentEl.text(),
              url: href,
            };
          });
      return range;
    };

export const domain = makeASTypeSelector('> tr:nth-child(3) > td', 'Domain:');
export const range = makeASTypeSelector('> tr:nth-child(4) > td', 'Range:');

export const functional = ($: CheerioSelector, $el: Cheerio) => {
  const [labelElement, valueElement] =
      $el.find('> tr:nth-child(5) > td').toArray().slice(0, 2);
  const label = $(labelElement).text();
  const expectedLabel = 'Functional:';
  if (label !== expectedLabel) {
    // spec omits this alltogether for nonfunctional properties
    // (but we'll still support it being present and set to 'false')
    return false;
  }
  assert.equal(
      label, 'Functional:',
      `Expected label of '${expectedLabel}' when parsing ${
          name($, $el)}, but got ${label}`);
  switch ($(valueElement).text().toLowerCase()) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      throw new Error(
          `Can't determine whether property ${name($, $el)} is functional`);
  }
};
