import explanParser from "./examples/explanparser";
import { makeInput } from "./src/string";

function ThrowError(message: string | undefined = undefined): never {
    throw new Error(message);
}
const source = " 42 + 13   *2";
const parsingResult = explanParser(source);
const tree = parsingResult.success ? parsingResult.value : ThrowError("Can not parse source");
const result = tree.evalRoot();
"The End";