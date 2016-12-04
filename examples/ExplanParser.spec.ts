import { readFileSync } from "fs";
import { expect } from "chai";

import explanParser from "./ExplanParser";
import { Implementation } from "./ExplanParser";
import { evaluate } from "./Explan";
import * as explan from "./Explan";
import parse from "../src/TestHelpers";

function ThrowError(message: string | undefined = undefined): never {
    throw new Error(message);
}

describe("Units", () => {
    it("identifier", () => {
        parse(Implementation.trivia).against("  \n\r some").shouldMatch();
    });

    it("commaExpression", () => {
        parse(Implementation.commaExpression).against(", a").shouldBeReversible();
        parse(Implementation.commaExpression).against("  ,5 + 8").shouldBeReversible();
        parse(Implementation.commaExpression.anyNumber()).against("").shouldProduce([]);
        parse(Implementation.commaExpression.anyNumber()).against(", 2 , 5").shouldMatchString(", 2, , 5");
    });

    it("expressionList", () => {
        parse(Implementation.expressionList).against("   x").should(el => !!el.tail);
        parse(Implementation.expressionList).against("   x").shouldBeReversible();
        parse(Implementation.expressionList).against("   x, y").shouldBeReversible();
        parse(Implementation.expressionList).against("   x, y   ,z    ,").shouldBeReversible();
    });

    it("expression", () => {
        parse(Implementation.expression).against("x+(y-z)").shouldBeReversible();
    });

    it("callExpression", () => {
        parse(Implementation.callExpression).against("f:x").shouldBeReversible();
    });

    describe("expression", () => {
        function parseExpression() {
            return parse(Implementation.expression);
        }

        function syntaxTree<T extends explan.Expression>(exp: string): T {
            return parseExpression().against(exp).result() as T;
        }

        function evaluate<T>(exp: string): T {
            return parseExpression().against(exp).result().rootEval().value as any as T;
        }

        function expectEval<T>(exp: string) {
            return expect(evaluate<T>(exp));
        }

        it("number", () => {
            expect(evaluate<number>("100")).equal(100);
            expect(evaluate<number>("042")).equal(42);
        });

        it("bool", () => {
            expect(evaluate<boolean>("true")).to.be.true;
            expect(evaluate<boolean>("   true")).to.be.true;
            expect(evaluate<boolean>("true  ")).to.be.true;
            expect(evaluate<boolean>(" \n true \r")).to.be.true;
            expect(evaluate<boolean>("false")).to.be.false;
            expect(evaluate<boolean>("\n\n\r false   ")).to.be.false;
        });

        it("sum", () => {
            expectEval<number>("2+3").to.be.eq(5);
            expectEval<number>("  \n 42 - 13 \n").to.be.eq(29);
        });

        it("mult", () => {
            expectEval<number>("42*2").to.be.eq(84);
            expectEval<number>("  \r13\n*2 + 14").eq(40);
        });

        it("callExpression", () => {
            const fx = syntaxTree<explan.CallExpression>("f:x");
            expect(fx.fnExp.as<explan.IdentifierExpression>().id.identifier).eq("f");
            expect(fx.argExp.as<explan.IdentifierExpression>().id.identifier).eq("x");
        });

        describe("complex", () => {
            const letfact = "letfun fact n = if n <= 1 then 1 else n * fact:(n-1) ";
            const letA = "let a = 5";
            it("letfun alone works", () => {
                expectEval<number>("letfun f x = x in f:3").eq(3);
                expectEval<number>(letfact + "in fact: 5").eq(120);
            });
        });
    });
});

describe("Integration", () => {
    describe("Sample program", () => {

        function read() {
            const sourceCode = readFileSync("./examples/sample.x", "utf-8");
            const parsingResult = explanParser(sourceCode);
            expect(parsingResult.success, "Can't parse sample").to.be.true;
            const syntaxTree = parsingResult.success ? parsingResult.value : ThrowError();

            return {
                result: parsingResult,
                source: sourceCode,
                tree: syntaxTree,
            };
        }

        it("produce correct result", () => {
            const result = evaluate(read().tree);
            expect(result.value as number).to.be.equal(120);
        });

        it("restore source code from syntax tree", () => {
            const c = read();
            expect(c.tree.toString()).to.be.equal(c.source);
        });
    });
});
