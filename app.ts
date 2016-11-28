import explanParser from "./examples/ExplanParser";
import { parser } from "./examples/ExplanParser";

function ThrowError(message: string | undefined = undefined): never {
    throw new Error(message);
}

const p = parser;
const source = " 42 + 13   *0.2 - 8";
const parsingResult = explanParser(source);
const tree = parsingResult.success ? parsingResult.value : ThrowError("Can not parse source");
const result = tree.evalRoot();
const end = "The End";
