import { readFileSync } from 'fs';
import { expect } from 'chai';

import explanParser from './explanParser';
import { Implementation } from './explanParser';
import { evaluate } from './explan';
import * as explan from './explan';
import parse from '../src/testHelpers';

function ThrowError(message: string | undefined = undefined): never {
    throw new Error(message);
}

describe("Units", () => {
    it("identifier", () => {
        parse(Implementation.trivia).against("  \n\r some").shouldMatch();
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

    it("identifierExpression", () => {
        parse(Implementation.identifierExpression).against("   foo").shouldBeReversible();
        parse(Implementation.identifierExpression).against("   42foo").shouldFail();
    });

    it("referenceExpression", () => {
        parse(Implementation.referenceExpression).against(" foo bar").shouldBeReversible();
        parse(Implementation.referenceExpression).against(" foo 0 1 bar baz").shouldBeReversible();
        expect(parse(Implementation.referenceExpression).against(" foo 0 1 in").remainingStream()).to.be.eq(" in");
    });

    it("indexer", () => {
        parse(Implementation.indexer).against("[0]").shouldBeReversible();
        parse(Implementation.indexer).against('["0"]').shouldBeReversible();
    });

    it("indexExpression", () => {
        parse(Implementation.indexExpression).against('foo["0"]').shouldBeReversible();
        parse(Implementation.indexExpression).against("foo['0']").shouldBeReversible();
        parse(Implementation.indexExpression).against("foo[0]").shouldBeReversible();
    });

    it("topId", () => {
        parse(Implementation.topId).against("foo").shouldBeReversible();
        parse(Implementation.topId).against("bar42").shouldBeReversible();

        parse(Implementation.topId).against("42baz").shouldFail();
        parse(Implementation.topId).against("in").shouldFail();
    });

    it("fieldId", () => {
        parse(Implementation.fieldId).against("foo").shouldBeReversible();
        parse(Implementation.fieldId).against("bar42").shouldBeReversible();
        parse(Implementation.fieldId).against("42baz").shouldBeReversible();

        parse(Implementation.fieldId).against("in").shouldFail();
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
            expect(evaluate<number>("0")).equal(0);
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

        it("referenceExpression", () => {
            expectEval<number>("(13, 42) 1").to.be.eq(42);
            expectEval<number>("(13, (1, (2, 3))) 1 1 0").to.be.eq(2);
        });

        it("indexExpression", () => {
            expectEval<number>('(13, 42) ["0"]').to.be.eq(13);
            expectEval<number>("(13, 42) [0]").to.be.eq(13);
            expectEval<number>("(13, (42, 11), 7) [1]['0']").to.be.eq(42);
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
