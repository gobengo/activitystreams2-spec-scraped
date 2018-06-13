export interface ParsedClass {
  name: string;
  notes: string;
  subClassOf: {name: string; href?: string;};
}

export interface Link {
  type: 'Link';
  name: string;
  href: string;
}

export interface Example {
  name: string;
  id: string;
  mainEntity: object;
}

export interface OwlClassUnion {
  type: 'owl:Class'
  unionOf: Array<string|Link>
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

type RDFList<Member> = Member[]

interface Ontology<Member> {
  "@context": {
    owl: 'http://www.w3.org/2002/07/owl#',
    members: 'owl:members'
  }
  type: 'owl:Ontology'
  members: RDFList<Member>
}

export interface ScrapedVocabulary {
  activityTypes: Ontology<ParsedClass>;
  actorTypes: Ontology<ParsedClass>;
  objectTypes: Ontology<ParsedClass>;
  properties: Ontology<Property>
}
