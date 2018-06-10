export const name = ($: CheerioSelector, $el: Cheerio) => {
  const name = $el.find('> tr:first-child > td:first-child dfn').text();
  return name;
};
