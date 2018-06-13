/**
 * @file Functions that will select different bits of metadata from the HTML
 * Elements documenting each Activity Vocabulary item (e.g. Activity Type,
 * Property)
 */
import assert from 'assert';
import * as urlm from 'url';

import {LabeledSection, makeTableSelector, optionalRow, TableSection, TableShape} from './tables';
import {Link, OwlClassUnion} from './types';
import {CheerioSelector} from './types/cheerio';



// TableShapes for the tables storing all the juicy data in the AS2 Vocab Spec
// clang-format off
/** TableShape that all tables have in common for first couple rows */
export const commonTableShape: TableShape = [
  [TableSection.name, ...new LabeledSection(TableSection.uri, 'URI:'), TableSection.example],
  new LabeledSection(TableSection.notes, 'Notes:'),
];

/** TableShape for AS2 Vocab Activity Types */
export const activityTypeTableShape: TableShape = [
  ...commonTableShape,
  new LabeledSection(TableSection.extends, 'Extends:'),
  new LabeledSection(TableSection.properties, 'Properties:'),
];

/** TableShape for AS2 Vocab Properties */
export const propertyTableShape: TableShape = [
  ...commonTableShape,
  new LabeledSection(TableSection.domain, 'Domain:'),
  new LabeledSection(TableSection.range, 'Range:'),
  optionalRow(new LabeledSection(TableSection.functional, 'Functional:')),
  optionalRow(new LabeledSection(TableSection.subPropertyOf, 'Subproperty Of:')),
];
// clang-format on

export const name = ($: CheerioSelector, $el: Cheerio) => {
  const $name =
      makeTableSelector(propertyTableShape, TableSection.name)($, $el);
  return $name.text();
};

export const notes = ($: CheerioSelector, $el: Cheerio) => {
  const $notes =
      makeTableSelector(commonTableShape, TableSection.notes)($, $el);
  const cleanHtml = (rawHtml: string) => rawHtml.trim().replace(/\s\s+/g, ' ');
  return cleanHtml($notes.text());
};

export const activityTypeSubClassOf =
    ($: CheerioSelector, $el: Cheerio, baseUrl: string) => {
      const $extends = makeTableSelector(activityTypeTableShape,
                                         TableSection.extends)($, $el);
      const subClassOfName = $extends.find('code').text();
      assert(subClassOfName, `Failed to find subClassOf for ${name}`);
      const extendsHref = $extends.find('a').attr('href');
      const extendsAbsoluteUrl =
          extendsHref && urlm.resolve(baseUrl, extendsHref);
      const subClassOf = {
        name: subClassOfName,
        ...extendsAbsoluteUrl &&
            {
              type: 'Link', href: extendsAbsoluteUrl
            }
      };
      return subClassOf;
    };

const closestTrLabel = ($el: Cheerio) => {
  const label = $el.closest('tr').find('> td:nth-child(1)').text();
  return label;
};

export const id = ($: CheerioSelector, $el: Cheerio) => {
  const $uri =
      makeTableSelector(activityTypeTableShape, TableSection.uri)($, $el);
  const id = $uri.text();
  return id;
};

export const example = ($: CheerioSelector, $el: Cheerio, baseUrl: string) => {
  const examples =
      makeTableSelector(commonTableShape, TableSection.example)($, $el)
          .find('*[id]')
          .toArray()
          .map((el) => {
            const $example = $(el);
            const domId = $example.attr('id');
            const example = {
              name: $example.find('.example-title').text(),
              id: domId && urlm.resolve(baseUrl, `#${domId}`),
              mainEntity: JSON.parse($example.find('.json').text()),
            };
            return example;
          });
  return examples;
};

export const url = ($: CheerioSelector, $el: Cheerio) => {
  const anchorName =
      makeTableSelector(commonTableShape, TableSection.name)($, $el)
          .find('dfn')
          .attr('id');
  return `#${anchorName}`;
};

type Selector = ($: CheerioSelector, $el: Cheerio) => Cheerio;

const makeDomainOrRangeSelector = (selectDomainOrRange: Selector) => (
    $: CheerioSelector, $el: Cheerio): OwlClassUnion => {
  const as2TypeLinks =
      selectDomainOrRange($, $el).find('code').toArray().map((as2TypeEl) => {
        const $as2TypeEl = $(as2TypeEl);
        const name = $as2TypeEl.text();
        const href = $as2TypeEl.find('a').attr('href');
        // assuming it's a URI or curie
        if (!href) return name;
        const link: Link = {
          type: 'Link',
          name,
          href,
        };
        return link;
      });
  return {type: 'owl:Class', unionOf: as2TypeLinks};
};

export const domain = makeDomainOrRangeSelector(
    makeTableSelector(propertyTableShape, TableSection.domain));
export const range = makeDomainOrRangeSelector(
    makeTableSelector(propertyTableShape, TableSection.range));

export const functional = ($: CheerioSelector, $el: Cheerio) => {
  const $functional =
      $(makeTableSelector(propertyTableShape, TableSection.functional)($, $el));
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
      $(makeTableSelector(propertyTableShape, TableSection.subPropertyOf)(
            $, $el))
          .find('code')
          .toArray()
          .map((el) => {
            return {
              type: 'Link' as 'Link',
              name: $(el).text(),
              href: $(el).find('a').attr('href'),
            };
          });
  if (subPropertyOf.length > 1) {
    throw new Error(`subPropertyOf should not have more than 1 value`);
  }
  return subPropertyOf[0];
};

export const propertyTypes = ($: CheerioSelector, $el: Cheerio) => {
  const collapseEmpty = <T>(arr: T[]): T[]|void => arr.length ? arr : undefined;
  const types = collapseEmpty([
    'rdf:Property',
    domainIncludesObject(domain($, $el)) && 'owl:ObjectProperty',
    functional($, $el) && 'owl:FunctionalProperty',
  ].filter(Boolean));
  return types;
};

const objectClassUri = '#dfn-object';
// @todo (bengo.is) this will fail if the domain has a subClassOf of Object
// but not Object itself. Need to walk up
const domainIncludesObject = (domain: OwlClassUnion) =>
    domain.unionOf
        .filter((l) => {
          if (typeof l === 'string') return l === objectClassUri;
          return l.href === objectClassUri;
        })
        .length;
