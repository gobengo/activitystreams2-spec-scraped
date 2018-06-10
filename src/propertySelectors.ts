import assert from 'assert';

export const name = ($: CheerioSelector, $el: Cheerio) => {
  const name = $el.find('> tr:first-child > td:first-child dfn').text();
  return name;
};

export const id = ($: CheerioSelector, $el: Cheerio) => {
  const uriLabel = $el.find('> tr:first-child > td:nth-child(2)').text();
  assert.equal(
      uriLabel, 'URI:',
      `Expected uriLabel of 'URI:' when parsing Property ${
          name($, $el)}, but got ${uriLabel}`);
  const id = $el.find('> tr:first-child > td:nth-child(3)').text();
  return id;
};
