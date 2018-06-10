export interface ActivityType {
  name: string;
  notes: string;
  subClassOf: {name: string; href?: string;};
}

export interface Link {
  type: 'Link';
  name: string;
  href: string;
}

export interface Property {
  name: string;
  id: string;
  url: string;
  notes: string;
  domain: Link[];
  range: Link[];
  functional: boolean;
  subPropertyOf?: Link;
}

export interface ScrapedVocabulary {
  activityTypes: ActivityType[];
  properties: Property[]
}
