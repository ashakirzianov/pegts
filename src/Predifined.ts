import {
    iff, iffNot, 
    str, notStr, anyChar,
    StringParserBuilder,
} from "./FluentBuilder";

export const whiteSpace = str(" ");
export const trivia = whiteSpace.anyNumber();

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
