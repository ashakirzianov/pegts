import explanParser from "./examples/explanparser";

function ThrowError(message: string | undefined = undefined): never {
    throw new Error(message);
}
const source = " 42 + 13   *2";
const parsingResult = explanParser(source);
const tree = parsingResult.success ? parsingResult.value : ThrowError("Can not parse source");
const result = tree.evalRoot();
const end = "The End";
