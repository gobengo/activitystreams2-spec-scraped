export interface ActivityType {
  name: string;
  notes: string;
  subClassOf: {name: string; href?: string;};
}

export interface ASType {
  name: string;
  id: string;
}

export interface Property {
  name: string;
  id: string;
  url: string;
  // notes: string;
  // domain: ASType;
  // range: ASType;
}

export interface ScrapedVocabulary {
  activityTypes: ActivityType[];
  properties: Property[]
}
