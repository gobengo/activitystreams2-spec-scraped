export const commonVocabsContext = {
	owl: "http://www.w3.org/2002/07/owl#",
	rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
	rdfs: "http://www.w3.org/2000/01/rdf-schema#",
	schema: "http://schema.org/",
	xsd: "http://www.w3.org/2001/XMLSchema#"
};
export const easyForJavaScriptJsonldContext = [
	"https://www.w3.org/ns/activitystreams",
	commonVocabsContext,
	{
		domain: "rdfs:domain",
		example: "schema:workExample",
		isDefinedBy: "rdfs:isDefinedBy",
		mainEntity: "schema:mainEntity",
		members: "owl:members",
		notes: "rdfs:comment",
		range: "rdfs:range",
		subClassOf: "rdfs:subClassOf",
		disjointWith: "owl:disjointWith",
		subPropertyOf: "rdfs:subPropertyOf",
		unionOf: "owl:unionOf",
		value: "rdf:value"
	},
	{
		sections: {
			"@id": "owl:imports",
			"@container": "@index"
		}
	}
];

export const scrapedVocabularyJsonldContext = easyForJavaScriptJsonldContext;
