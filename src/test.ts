import {scrapeVocabulary, vocabularySpecUrl} from '.';

export const test = async () => {
  // This will load from a fixture and *will not* make an http request
  await scrapeVocabulary();

  // Provide a URL to fetch the html from there, then parse
  await scrapeVocabulary(vocabularySpecUrl);
};

if (require.main === module) {
  test().catch(e => console.error(e) && process.exit(1));
}
