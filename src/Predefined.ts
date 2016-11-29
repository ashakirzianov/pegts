import {
    iff, iffNot,
    str, notStr, anyChar,
    Parser, ParserBuilder, StringParserBuilder,
} from "./FluentBuilder";

export const lineEnd = str("\n");
export const space = str(" ");
export const tab = str("\t");
export const whiteSpace = space.or(tab).or(lineEnd);

export const lineComment = str("//").followedBy(lineEnd.not().anyNumber()).followedBy(lineEnd);
const multiLineCommentInside = str("/").not().or(str("/").followedBy(str("*").not())).anyNumber();
export const multiLineComment = str("/*").followedBy(multiLineCommentInside).followedBy("*/");

export const trivia = whiteSpace.or(lineComment).or(multiLineComment).anyNumber();

export const digit = str("0").or("1").or("2").or("3").or("4").or("5").or("6").or("7").or("8").or("9");
const dot = str(".");
export const integer = digit.atLeastOne();
export const float = integer.followedBy(dot.followedBy(integer).maybe());

export const doubleQuoteString = quoted(str('"'));
export const singleQuoteString = quoted(str("'"));
export const aString = doubleQuoteString.or(singleQuoteString);

export const bool = str("true").or("false");

export const identifier = str("a").or("b").or("c"); // TODO: implement 

export function quoted(quoteParser: StringParserBuilder) {
    return quoteParser.followedBy(quoteParser.not().anyNumber()).followedBy(quoteParser);
}

export interface BinaryConstructor<TExp, TOp> {
    new (l: TExp, op: TOp, r: TExp): TExp;
}

export function binary<TExp, TOp>(
    expParser: ParserBuilder<string, TExp>, opParser: ParserBuilder<string, TOp>, con: BinaryConstructor<TExp, TOp>,
    ): ParserBuilder<string, TExp> {
        return expParser
            .followedBy(opParser.followedBy(expParser).adopt((o, e) => { return { op: o, exp: e }; }).anyNumber())
            .adopt((init, rest) => rest.reduce((acc, pair) => new con(acc, pair.op, pair.exp), init));
}
