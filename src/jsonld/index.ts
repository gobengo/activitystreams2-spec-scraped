import { createDefaultJsonldDocumentLoader } from "./loader";

export const defaultJsonldOptions = {
	documentLoader: createDefaultJsonldDocumentLoader(),
	processingMode: "json-ld-1.1"
};
