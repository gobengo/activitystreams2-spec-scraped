import {scrapeVocabulary, vocabularySpecUrl} from '.';

(async () => {
  let v;

  // This will load from a fixture and *will not* make an http request
  v = await scrapeVocabulary();

  // Provide a URL to fetch the html from there, then parse
  v = await scrapeVocabulary(vocabularySpecUrl);

  console.log(v);
})();
