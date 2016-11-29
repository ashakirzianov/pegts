import { Parser } from "../src/Core";
import {
    Trivia, Symbol, Keyword,
    Expression, BinaryExpression, LiteralExpression, IfExpression, LetExpression, IdentifierExpression, ParenthesisExpression,
    LetDeclaration, NumLiteral, BoolLiteral, StringLiteral, Identifier,
} from "./explan";
import {
    atLeastOne, anyNumberOf,
    startsWith, either, builder,
    str, stringInput,
    recursive,
} from "../src/fluentBuilder";

import * as pre from "../src/Predefined";

const add = str("+").parser;
const sub = str("-").parser;
const mult = str("*").parser;
const div = str("/").parser;

const trivia = pre.trivia.produce(Trivia);

function parseKeyword(word: string) {
    return trivia.followedBy(str(word)).produce(Keyword);
}
const ifKeyword = parseKeyword("if");
const thenKeyword = parseKeyword("then");
const elseKeyword = parseKeyword("else");
const letKeyword = parseKeyword("let");
const inKeyword = parseKeyword("in");

const keyword = ifKeyword
    .or(thenKeyword)
    .or(elseKeyword)
    .or(letKeyword)
    .or(inKeyword);

function parseSymbol(sym: string) {
    return trivia.followedBy(str(sym)).produce(Symbol);
}

const eqSym = parseSymbol("=");
const openOval = parseSymbol("(");
const closeOval = parseSymbol(")");

const numLiteral = trivia.followedBy(pre.float).produce(NumLiteral);
const literal = numLiteral;
const id = trivia.followedBy(pre.identifier).produce(Identifier);

const addPrescOperator = trivia.followedBy(either(add).or(sub)).produce(Symbol);

const multPrescOperator = trivia.followedBy(either(mult).or(div)).produce(Symbol);

const expression = recursive<Expression>();

const identifierExpression = startsWith(id.parser).produce(IdentifierExpression);
const literalExpression = literal.produce(LiteralExpression);
const atomExpression = either<string, Expression>(literalExpression).or(identifierExpression);

const declaration = letKeyword.followedBy(id).followedBy(eqSym).followedBy(expression).produce(LetDeclaration);

const multExpression = pre.binary(atomExpression, multPrescOperator, BinaryExpression);
const addExpression = pre.binary(multExpression, addPrescOperator, BinaryExpression);
const arithmeticExpression = addExpression;

const ifExpression = ifKeyword
    .followedBy(expression)
    .followedBy(thenKeyword)
    .followedBy(expression)
    .followedBy(elseKeyword)
    .followedBy(expression)
    .produce(IfExpression);
const letExpression = declaration.atLeastOne()
    .followedBy(inKeyword)
    .followedBy(expression)
    .produce(LetExpression);
const parenthesisExpression = openOval.followedBy(expression).followedBy(closeOval).produce(ParenthesisExpression);

expression.set(
    either<string, Expression>(ifExpression)
    .or(letExpression)
    .or(parenthesisExpression)
    .or(arithmeticExpression));

export const parser = expression;
export default function parseString(source: string) {
    return parser.parse(stringInput(source));
}
