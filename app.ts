import explanParser from "./examples/ExplanParser";
import { parser } from "./examples/ExplanParser";
import { evaluate } from "./examples/Explan";

function ThrowError(message: string | undefined = undefined): never {
    throw new Error(message);
}

const p = parser;
const source = "let a = 42 let b =   12 in a * b";
const parsingResult = explanParser(source);
const tree = parsingResult.success ? parsingResult.value : ThrowError("Can not parse source");
const result = evaluate(tree);
const end = "The End";
