export interface ActivityType {
  name: string;
  notes: string;
  subClassOf: {name: string; href?: string;};
}

// @todo (bengo.is) this should probably just be a Link, given what I'm using it for
export interface ASType {
  name: string;
  url: string;
}

export interface Property {
  name: string;
  id: string;
  url: string;
  notes: string;
  domain: ASType[];
  range: ASType[];
  functional: boolean;
  subPropertyOf?: ASType;
}

export interface ScrapedVocabulary {
  activityTypes: ActivityType[];
  properties: Property[]
}
