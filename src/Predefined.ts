import {
    iff, iffNot,
    str, notStr, anyChar, charset,
    Parser, ParserBuilder, StringParserBuilder,
} from "./FluentBuilder";

export const lineEnd = str("\n").or("\r");
export const space = str(" ");
export const tab = str("\t");
export const whiteSpace = space.or(tab).or(lineEnd);

export const lineComment = str("//").followedBy(lineEnd.not().anyNumber()).followedBy(lineEnd);
const multiLineCommentInside = str("/").not().or(str("/").followedBy(str("*").not())).anyNumber();
export const multiLineComment = str("/*").followedBy(multiLineCommentInside).followedBy("*/");

export const trivia = whiteSpace.or(lineComment).or(multiLineComment).anyNumber();

export const letter = charset("A-Za-z");

export const digit = charset("0-9");
const dot = str(".");
export const integer = digit.atLeastOne();
export const float = integer.followedBy(dot.followedBy(integer).maybe());

export const doubleQuoteString = quoted(str('"'));
export const singleQuoteString = quoted(str("'"));
export const aString = doubleQuoteString.or(singleQuoteString);

export const bool = str("true").or("false");

export const alphanum = letter.or(digit);
export const identifier = letter.followedBy(alphanum.anyNumber());

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

export interface PostConstructor<TExp, TPost> {
    new (e: TExp, p: TPost): TExp;
}

export function postfix<TExp, TPost>(exp: ParserBuilder<string, TExp>, post: ParserBuilder<string, TPost>, con: PostConstructor<TExp, TPost>) {
    return exp.followedBy(post.anyNumber()).adopt((head, tail) => tail.reduce((e, p) => new con(e, p), head));
}

export type SeparatorSyntax<TSeparator, TSyntax> = { separator: TSeparator, syntax: TSyntax };
export interface SyntaxListConstructor<TSyntax, TSeparator, TResult> {
    new (head: TSyntax, tail: Array<SeparatorSyntax<TSeparator, TSyntax>>, last?: TSeparator): TResult;
}

export function syntaxList<TSyntax, TSeparator, TResult>(
    syntax: ParserBuilder<string, TSyntax>,
    separator: ParserBuilder<string, TSeparator>,
    con: SyntaxListConstructor<TSyntax, TSeparator, TResult>,
    ): ParserBuilder<string, TResult> {
    const separatorSyntax = separator.followedBy(syntax).adopt((sep, syn) => {
        return {
            separator: sep,
            syntax: syn,
        };
    });
    return syntax
        .followedBy(separatorSyntax.anyNumber())
        .followedBy(separator.maybe())
        .produce(con);
}
