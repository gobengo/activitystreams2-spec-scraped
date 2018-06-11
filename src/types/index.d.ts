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

export interface DataType {
  unionOf: Array<string|Link>
}

export interface Property {
  name: string;
  id: string;
  url: string;
  notes: string;
  domain: DataType;
  range: DataType;
  subPropertyOf?: Link;
  isDefinedBy: string;
  example: Example[];
}

export interface ScrapedVocabulary {
  activityTypes: ParsedClass[];
  actorTypes: ParsedClass[];
  objectTypes: ParsedClass[];
  properties: Property[]
}
