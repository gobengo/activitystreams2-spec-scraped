import assert from "assert";
import * as url from "url";

import { as2NsUrl, scrapeVocabulary, vocabularySpecUrl } from ".";
import { defaultJsonldOptions } from "./jsonld";
import { easyForJavaScriptJsonldContext } from "./jsonld/context";
import { ParsedClass, Property, ScrapedVocabulary } from "./types";

const { promises: jsonld } = require("jsonld");

type IRI = string;
interface LDObject {
	"@id": IRI;
	"@type": IRI;
}

const owl = {
	imports: "http://www.w3.org/2002/07/owl#imports",
	Ontology: "http://www.w3.org/2002/07/owl#Ontology"
};

const graphIncludes = async (graph: object, iri: string) => {
	const framed = await jsonld.frame(
		graph,
		{ "@id": iri },
		defaultJsonldOptions
	);
	return Boolean(framed["@graph"].length);
};
const assertGraphIncludes = async (graph: object, iri: string) => {
	assert(await graphIncludes(graph, iri), `graph includes ${iri}`);
};
const as2Term = (term: string) => `${as2NsUrl}${term}`;

const testJsonLd = async (vocab: ScrapedVocabulary) => {
	const expanded = await jsonld.expand(vocab, defaultJsonldOptions);
	const flattened = await jsonld.flatten(vocab, null, defaultJsonldOptions);
	const bNodes = flattened.filter((n: LDObject) => n["@id"].startsWith("_:"));
	const nodesNoType = flattened.filter((n: LDObject) => !n["@type"]);
	const ontologiesFramed = await jsonld.frame(
		vocab,
		{ "@type": owl.Ontology },
		defaultJsonldOptions
	);
	const ontologies = ontologiesFramed["@graph"];
	assert.equal(
		ontologies.length,
		6,
		"there are five total ontologies 1 + 5 subsections"
	);
	const mainOntologyFramed = await jsonld.frame(
		vocab,
		{
			"@id": vocabularySpecUrl
		},
		defaultJsonldOptions
	);
	assert.equal(mainOntologyFramed["@graph"].length, 1);
	// Get rid of ["@graph"][], but assign @context to it
	const mainOntology = Object.assign({}, mainOntologyFramed["@graph"][0], {
		"@context": mainOntologyFramed["@context"]
	});
	assert.equal(
		mainOntology[owl.imports].length,
		5,
		"Whole AS2 Ontology imports 5 subparts"
	);
	// @todo (bengo.is) actually we want this to be 0, but the last two are
	// actually from some examples in the vocabulary itself
	assert.equal(
		nodesNoType.length,
		2,
		"all nodes in output JSON-LD should have a type"
	);
};

const getNode = async (data: object, iri: string, context: object) => {
	const framed = await jsonld.frame(
		data,
		{ "@context": context, "@id": iri },
		defaultJsonldOptions
	);
	const framedGraph = framed["@graph"];
	assert.equal(framedGraph.length, 1, `graph contains node ${iri}`);
	const node = framedGraph[0];
	return node;
};

export const test = async () => {
	// This will load from a fixture and *will not* make an http request
	const vocab = await scrapeVocabulary();

	await assertGraphIncludes(vocab, as2Term("Collection"));
	await assertGraphIncludes(vocab, as2Term("Question"));

	const linkClass: ParsedClass = await getNode(
		vocab,
		as2Term("Link"),
		easyForJavaScriptJsonldContext
	);
	assert.deepStrictEqual(linkClass.disjointWith, {
		type: "Link",
		name: "Object",
		href: "https://www.w3.org/TR/activitystreams-vocabulary/#dfn-object"
	});

	// const urlProperty: Property = await getNode(vocab, as2Term('@id'),
	// easyForJavaScriptJsonldContext);

	assert.equal(vocab.sections.coreTypes.members.length, 8);
	assert.equal(vocab.sections.activityTypes.members.length, 28);
	assert.equal(vocab.sections.actorTypes.members.length, 5);
	assert.equal(vocab.sections.objectTypes.members.length, 13);
	assert.equal(vocab.sections.properties.members.length, 62);
	await testJsonLd(vocab);
};

if (require.main === module) {
	test().catch(e => console.error(e) && process.exit(1));
}
