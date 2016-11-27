import {
    iff, iffNot, 
    str, notStr, anyChar,
    StringParserBuilder,
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

export function quoted(quoteParser: StringParserBuilder) {
    return quoteParser.followedBy(quoteParser.not().anyNumber()).followedBy(quoteParser);
}
