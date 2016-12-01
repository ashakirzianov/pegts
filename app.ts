import explanParser from "./examples/ExplanParser";
import { parser } from "./examples/ExplanParser";
import { evaluate } from "./examples/Explan";

function ThrowError(message: string | undefined = undefined): never {
    throw new Error(message);
}

const p = parser;
// const source = "let a = 42 let b =   12 let fact = fn n => if n <= 1 then 1 else n * self n in fact 7";
const source = "let f = fn n => if n <= 1 then 1 else n * self (n-1) in f 5";
const parsingResult = explanParser(source);
const tree = parsingResult.success ? parsingResult.value : ThrowError("Can not parse source");
const result = evaluate(tree);
const end = "The End";
