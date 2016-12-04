import { readFileSync } from "fs";
import { expect } from "chai";

import explanParser from "./ExplanParser";
import { evaluate } from "./Explan";

function ThrowError(message: string | undefined = undefined): never {
    throw new Error(message);
}

describe("Integration", () => {
    describe("Sample program", () => {
        const source = readFileSync("./examples/sample.x", "utf-8");
        const parsingResult = explanParser(source);
        expect(parsingResult.success).to.be.true;
        const tree = parsingResult.success ? parsingResult.value : ThrowError();

        it("produce correct result", () => {
            const result = evaluate(tree);
            expect(result.value as number).to.be.equal(120);
        });

        it("restore source code from syntax tree", () => {
            expect(tree.toString()).to.be.equal(source);
        });
    });
});
