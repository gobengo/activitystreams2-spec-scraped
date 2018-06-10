export interface ActivityType {
  name: string;
  notes: string;
  subClassOf: {name: string; href?: string;};
}

export interface ScrapedVocabulary {
  activityTypes: ActivityType[];
}

declare module "*.html" {
  const content: string;
  export default content;
}
