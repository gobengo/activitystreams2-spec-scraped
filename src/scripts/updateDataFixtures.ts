import * as fs from "fs";
import { writeFile, writeFileSync } from "fs";
import * as path from "path";
import { promisify } from "util";

import { as2ContextUrl, scrapeVocabulary } from "../";
import { defaultJsonldOptions } from "../jsonld";
import {
	commonVocabsContext,
	easyForJavaScriptJsonldContext
} from "../jsonld/context";
import { createDefaultJsonldDocumentLoader } from "../jsonld/loader";
import { ScrapedVocabulary } from "../types";

const { promises: jsonld } = require("jsonld");

const compactedContext = [as2ContextUrl, commonVocabsContext];

/**
 * Write a form of the vocabulary that minimizes use of mapped terms unique to
 * this repo (but uses more curies with ':' that are annoying to dot-access in
 * JavaScript)
 */
const compactedVocabulary = async (vocab: ScrapedVocabulary) => {
	const compacted = await jsonld.compact(
		vocab,
		compactedContext,
		defaultJsonldOptions
	);
	return compacted;
};

/**
 * Return a form of the vocabulary that should be easily consumed by JavaScript
 * devs who don't care about JSON-LD. e.g. there should be no ':' in property
 * names
 */
const easyForJsVocabulary = async (vocab: ScrapedVocabulary) => {
	const compacted = await jsonld.compact(
		vocab,
		easyForJavaScriptJsonldContext,
		defaultJsonldOptions
	);
	return compacted;
};

const normalizedVocabulary = async (vocab: ScrapedVocabulary) => {
	const compacted = await jsonld.normalize(vocab, defaultJsonldOptions);
	return compacted;
};

const flattenedVocabulary = async (vocab: ScrapedVocabulary) => {
	const compacted = await jsonld.flatten(
		vocab,
		easyForJavaScriptJsonldContext,
		defaultJsonldOptions
	);
	return compacted;
};

// Given a map of file paths to file contents, write them all in parallel
const writeFiles = async (files: {
	[key: string]: string | object | Promise<string | object>;
}) => {
	await Promise.all(
		Object.entries(files).map(async ([filename, promiseContents]) => {
			const contents = await Promise.resolve(promiseContents);
			return promisify(writeFile)(
				filename,
				typeof contents === "string"
					? contents
					: JSON.stringify(contents, null, 2)
			);
		})
	);
};

/**
 * For each *.html file in a dir, parse the AS2 vocab, format it in a certain
 * way, then write to files with a similar name
 */
const main = async (
	dir = path.join(__dirname, "../../data/activitystreams-vocabulary")
) => {
	const vocab = await scrapeVocabulary();
	const htmlFiles = fs
		.readdirSync(dir)
		.filter(filename => filename.endsWith(".html"));
	await Promise.all(
		htmlFiles.map(htmlFilename => {
			const nameNoExtension = htmlFilename.replace(/\.html$/, "");
			return writeFiles({
				[path.join(dir, `${nameNoExtension}.json`)]: easyForJsVocabulary(vocab),
				[path.join(
					dir,
					`${nameNoExtension}-normalized.json`
				)]: normalizedVocabulary(vocab),
				[path.join(
					dir,
					`${nameNoExtension}-flattened.json`
				)]: flattenedVocabulary(vocab),
				[path.join(
					dir,
					`${nameNoExtension}-compacted.json`
				)]: compactedVocabulary(vocab)
			});
		})
	);
};

if (require.main === module) {
	main().catch(error => console.error(error) && process.exit(1));
}
