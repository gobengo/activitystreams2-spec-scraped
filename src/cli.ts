import { Readable } from "stream";
import { scrapeVocabulary } from ".";

/**
 * Scrape and write to stdout
 */
export const cli = async () => {
	const vocab = await scrapeVocabulary();
	const out = [JSON.stringify(vocab, null, 2), "\n"].join("");
	const stringReader = (str: string) => {
		const r = new Readable();
		r.push(str);
		r.push(null);
		return r;
	};
	return new Promise((resolve, reject) => {
		stringReader(out)
			.pipe(process.stdout)
			.once("error", reject)
			.once("drain", resolve);
	});
};

if (require.main === module) {
	(async () => {
		await cli();
	})();
}
