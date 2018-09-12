export interface ParsedClass {
	name: string;
	notes: string;
	subClassOf: Link;
	disjointWith?: Link[];
	id: string;
	url: string;
	type: string;
}

export interface Link {
	type: "Link";
	name: string;
	href: string;
}

export interface Example {
	name: string;
	id: string;
	mainEntity: object;
}

export interface OwlClassUnion {
	type: "owl:Class";
	unionOf: Array<string | Link>;
}

export interface Property {
	name: string;
	id: string;
	url: string;
	notes: string;
	domain: OwlClassUnion;
	range: OwlClassUnion;
	subPropertyOf?: Link;
	isDefinedBy: string;
	example: Example[];
}

export type RDFList<Member> = Member[];

export interface Ontology<Member> {
	"@context": {
		owl: "http://www.w3.org/2002/07/owl#";
		members: "owl:members";
	};
	type: "owl:Ontology";
	members: RDFList<Member>;
}

export interface ScrapedVocabulary {
	sections: {
		activityTypes: Ontology<ParsedClass>;
		actorTypes: Ontology<ParsedClass>;
		objectTypes: Ontology<ParsedClass>;
		coreTypes: Ontology<ParsedClass>;
		properties: Ontology<Property>;
	};
}

export interface AS2CoreOntology {}
