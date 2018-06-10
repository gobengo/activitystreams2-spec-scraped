/**
 * @file Utilities for modeling and searching the HTML <table>s in the AS2 Specs
 */

// clang-format off
export enum TableSection {
  domain = 'domain',
  example = 'example',
  extends = 'extends',
  functional = 'functional',
  name = 'name',
  notes = 'notes',
  properties = 'properties',
  range = 'range',
  subPropertyOf = 'subPropertyOf',
  uri = 'uri',
}
// clang-format on

export class SectionLabel {
  constructor(public section: TableSection, public label: string) {}
}

export const isOptional = Symbol('isOptional');
type CanBeOptional = {
  [isOptional]?: boolean
};
type TableCell = (SectionLabel|TableSection)&CanBeOptional;
type TableRow = TableCell[]&CanBeOptional;
export type RichTableShape = TableRow[];

class TableRowPiece extends Array<TableCell> {}
class LabeledSection extends TableRowPiece {
  0: SectionLabel;
  1: TableSection;
  length = 2;
  constructor(section: TableSection, label: string) {
    super();
    this[0] = new SectionLabel(section, label);
    this[1] = section;
  }
  match($: CheerioSelector, el: CheerioElement) {
    return $(el).find('> td:nth-child(1)').text() === this[0].label;
  }
}
interface CanMatchElement {
  match($: CheerioSelector, el: CheerioElement): boolean;
}
const optionalRow = (row: TableRow&CanMatchElement) => {
  return Object.assign(row.slice(), {[isOptional]: true});
};

// clang-format off
export const betterPropertyTableShape: RichTableShape = [
  [TableSection.name, ...new LabeledSection(TableSection.uri, 'URI:'), TableSection.example],
  new LabeledSection(TableSection.notes, 'Notes:'),
  new LabeledSection(TableSection.domain, 'Domain:'),
  new LabeledSection(TableSection.range, 'Range:'),
  optionalRow(new LabeledSection(TableSection.functional, 'Functional:')),
  optionalRow(new LabeledSection(TableSection.subPropertyOf, 'Subproperty Of:')),
];
// clang-format on

export const rowMatchesShape =
    ($: CheerioSelector, row: CheerioElement, rowShape: TableRow) => {
      if (rowShape instanceof LabeledSection) {
        return rowShape.match($, row);
      }
      return $(row).find('td').toArray().length === rowShape.length;
    };


// What follows uses 'SimpleTableShapes'
// It proved insufficient to deal with the optional rows in the
// tables for AS2 properties, which optionally have rows for subPropertyOf and
// functional. I'm keeping them here for posterity.

type SimpleTableShape = string[][];

export const commonTableShape: SimpleTableShape =
    [['name', 'uriLabel', 'uri', 'example'], ['notesLabel', 'notes']];

export const activityTypeTableShape: SimpleTableShape = [
  ['name', 'uriLabel', 'uri', 'example'],
  ['notesLabel', 'notes'],
  ['extendsLabel', 'extends'],
  ['propertiesLabel', 'properties'],
];

export const propertyTableShape: SimpleTableShape = [
  ['name', 'uriLabel', 'uri', 'example'],
  ['notesLabel', 'notes'],
  ['domainLabel', 'domain'],
  ['rangeLabel', 'range'],
  ['functionalLabel', 'functional'],
];

const findTableCoords = (table: SimpleTableShape, section: string) => {
  const coords = {tr: 0, td: 0};
  for (const tr of table) {
    for (const td of tr) {
      if (td === section) return coords;
      coords.td++;
    }
    coords.td = 0;
    coords.tr++;
  }
  throw new Error(`Couldn't findTableCoords for section ${section}`);
};

export const tableQuery = (tableShape: SimpleTableShape, section: string) => {
  const coords = findTableCoords(tableShape, section);
  const query =
      `> tr:nth-child(${coords.tr + 1}) > td:nth-child(${coords.td + 1})`;
  return query;
};
