/**
 * @file Functions that will select different bits of metadata from the HTML
 * Elements documenting each Activity Vocabulary item (e.g. Activity Type,
 * Property)
 */
import assert from 'assert';
import * as urlm from 'url';

import {activityTypeTableShape, betterPropertyTableShape, commonTableShape, isOptional, propertyTableShape, RichTableShape, rowMatchesShape, tableQuery, TableSection,} from './tables';
import {ASType} from './types';
import {CheerioSelector} from './types/cheerio';

export const makeTableSelector =
    (tableShape: RichTableShape, target: TableSection) =>
        ($: CheerioSelector, $el: Cheerio): Cheerio => {
          const shapeRowIndex = 0;
          let rowIndex = 0;
          const rows = $el.find('> tr').toArray();
          let foundTargetInTableShape = false;
          for (const rowShape of tableShape) {
            const rowToCheck = rows[rowIndex];
            if (rowShape.includes(target)) {
              foundTargetInTableShape = true;
            }
            if (rowShape[isOptional]) {
              // determine whether nextRow is this optional one
              if (!rowMatchesShape($, rowToCheck, rowShape)) {
                // optional row isn't here. no worries
                continue;
              }
            }
            if (!rowToCheck) {
              throw new Error('Required row is missing');
            }
            if (rowShape.includes(target)) {
              // it should be here!
              const found =
                  $(rowToCheck).find('> td').get(rowShape.indexOf(target));
              if (!found) {
                throw new Error(
                    `target ${target} should be in this row, but it's not.`);
              }
              return $(found);
            }
            rowIndex++;
          }
          if (!foundTargetInTableShape) {
            throw new Error(
                `target ${target} not found in provided shape ${tableShape}`);
          }
          // just return empty Cheerio set. We didn't find anything
          return $('');
        };


/**
 * Clean up HTML we scraped. e.g. indented HTML will have lots of extra
 * whitespace we want to collapse.
 * @param rawHtml - html to clean
 */
const cleanHtml = (rawHtml: string) => rawHtml.trim().replace(/\s\s+/g, ' ');

export const name = ($: CheerioSelector, $el: Cheerio) => {
  const $name = $el.find(tableQuery(commonTableShape, 'name'));
  return $name.text();
};

export const notes = ($: CheerioSelector, $el: Cheerio) => {
  const $notes = $el.find(tableQuery(commonTableShape, 'notes'));
  return cleanHtml($notes.text());
};

export const activityTypeSubClassOf =
    ($: CheerioSelector, $el: Cheerio, baseUrl: string) => {
      const $extends = $el.find(tableQuery(activityTypeTableShape, 'extends'));
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

const closestTrLabel = ($el: Cheerio) => {
  const label = $el.closest('tr').find('> td:nth-child(1)').text();
  return label;
};

export const id = ($: CheerioSelector, $el: Cheerio) => {
  const $uri = $el.find(tableQuery(activityTypeTableShape, 'uri'));
  const id = $uri.text();
  return id;
};

export const example = ($: CheerioSelector, $el: Cheerio, baseUrl: string) => {
  const examples = $el.find(tableQuery(commonTableShape, 'example'))
                       .find('*[id]')
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
      $el.find(tableQuery(commonTableShape, 'name')).find('dfn').attr('id');
  return `#${anchorName}`;
};

const makeASTypeSelector = (domQuery: string, expectedLabel: string) => (
    $: CheerioSelector, $el: Cheerio): ASType[] => {
  const asTypeElement = $el.find(domQuery).get();
  const range = $el.find(domQuery).find('code').toArray().map((asTypeEl) => {
    const $asTypeEl = $(asTypeEl);
    const href = $asTypeEl.find('a').attr('href');
    return {
      name: $asTypeEl.text(),
      url: href,
    };
  });
  return range;
};

export const domain =
    makeASTypeSelector(tableQuery(propertyTableShape, 'domain'), 'Domain:');
export const range =
    makeASTypeSelector(tableQuery(propertyTableShape, 'range'), 'Range:');

export const functional = ($: CheerioSelector, $el: Cheerio) => {
  const $functional = $(makeTableSelector(
      betterPropertyTableShape, TableSection.functional)($, $el));
  // const $functional = $el.find(tableQuery(propertyTableShape, 'functional'))
  const functional = $functional.text();
  if (!functional) {
    // spec omits this alltogether for nonfunctional properties
    // (but we'll still support it being present and set to 'false')
    return false;
  }
  switch (functional.toLowerCase()) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      throw new Error(
          `Can't determine whether property ${name($, $el)} is functional`);
  }
};

export const subPropertyOf = ($: CheerioSelector, $el: Cheerio) => {
  const subPropertyOf =
      $(makeTableSelector(betterPropertyTableShape, TableSection.subPropertyOf)(
            $, $el))
          .find('code')
          .toArray()
          .map((el) => {
            return {
              name: $(el).text(),
              url: $(el).find('a').attr('href'),
            };
          });
  if (subPropertyOf.length > 1) {
    throw new Error(`subPropertyOf should not have more than 1 value`);
  }
  return subPropertyOf[0];
};
