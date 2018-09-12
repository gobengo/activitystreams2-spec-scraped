/**
 * @file Utilities for modeling and searching the HTML <table>s in the AS2 Specs
 */

// clang-format off
export enum TableSection {
	disjointWith = "disjointWith",
	domain = "domain",
	example = "example",
	extends = "extends",
	functional = "functional",
	name = "name",
	notes = "notes",
	properties = "properties",
	range = "range",
	subPropertyOf = "subPropertyOf",
	uri = "uri"
}
// clang-format on

export class SectionLabel {
	constructor(public section: TableSection, public label: string) {}
}

export const isOptional = Symbol("isOptional");
type CanBeOptional = {
	[isOptional]?: boolean;
};
type TableCell = (SectionLabel | TableSection) & CanBeOptional;
type TableRow = TableCell[] & CanBeOptional;
export type TableShape = TableRow[];

export class LabeledSection extends Array<TableCell> {
	0: SectionLabel;
	1: TableSection;
	length = 2;
	constructor(section: TableSection, label: string) {
		super();
		this[0] = new SectionLabel(section, label);
		this[1] = section;
	}
	match($: CheerioSelector, el: CheerioElement) {
		return (
			$(el)
				.find("> td:nth-child(1)")
				.text() === this[0].label
		);
	}
}
interface CanMatchElement {
	match($: CheerioSelector, el: CheerioElement): boolean;
}
export const optionalRow = (row: TableRow & CanMatchElement) => {
	return Object.assign(row.slice(), { [isOptional]: true });
};

export const rowMatchesShape = (
	$: CheerioSelector,
	row: CheerioElement,
	rowShape: TableRow
) => {
	if (rowShape instanceof LabeledSection) {
		return rowShape.match($, row);
	}
	return (
		$(row)
			.find("td")
			.toArray().length === rowShape.length
	);
};

export const makeTableSelector = (
	tableShape: TableShape,
	target: TableSection
) => ($: CheerioSelector, $el: Cheerio): Cheerio => {
	const shapeRowIndex = 0;
	let rowIndex = 0;
	const rows = $el.find("> tr").toArray();
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
			throw new Error("Required row is missing");
		}
		if (rowShape.includes(target)) {
			// it should be here!
			const found = $(rowToCheck)
				.find("> td")
				.get(rowShape.indexOf(target));
			if (!found) {
				throw new Error(
					`target ${target} should be in this row, but it's not.`
				);
			}
			return $(found);
		}
		rowIndex++;
	}
	if (!foundTargetInTableShape) {
		throw new Error(
			`target ${target} not found in provided shape ${tableShape}`
		);
	}
	// just return empty Cheerio set. We didn't find anything
	return $("");
};

// What follows uses 'SimpleTableShapes'
// It proved insufficient to deal with the optional rows in the
// tables for AS2 properties, which optionally have rows for subPropertyOf and
// functional. I'm keeping them here for posterity.

type SimpleTableShape = string[][];

// clang-format off
export const simpleCommonTableShape: SimpleTableShape = [
	["name", "uriLabel", "uri", "example"],
	["notesLabel", "notes"]
];
// clang-format on

// clang-format off
export const simpleActivityTypeTableShape: SimpleTableShape = [
	["name", "uriLabel", "uri", "example"],
	["notesLabel", "notes"],
	["extendsLabel", "extends"],
	["propertiesLabel", "properties"]
];
// clang-format on

const findTableCoords = (table: SimpleTableShape, section: string) => {
	const coords = { tr: 0, td: 0 };
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
	const query = `> tr:nth-child(${coords.tr + 1}) > td:nth-child(${coords.td +
		1})`;
	return query;
};
