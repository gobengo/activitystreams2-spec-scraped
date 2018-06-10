export interface ActivityType {
  name: string;
  notes: string;
  subClassOf: {name: string; href?: string;};
}

export interface ASType {
  name: string;
  uri: string;
}

export interface Property {
  name: string;
  // uri: string;
  // notes: string;
  // domain: ASType;
  // range: ASType;
}

export interface ScrapedVocabulary {
  activityTypes: ActivityType[];
  properties: Property[]
}
