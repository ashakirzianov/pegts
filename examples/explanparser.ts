import { Parser } from "../src/Core";
import {
    Trivia, Symbol, Keyword,
    Expression, BinaryExpression, LiteralExpression, IfExpression, LetExpression, IdentifierExpression, ParenthesisExpression,
    FuncExpression, CallExpression,
    LetDeclaration, NumLiteral, BoolLiteral, StringLiteral, Identifier,
} from "./explan";
import {
    atLeastOne, anyNumberOf,
    startsWith, either, builder,
    str, stringInput,
    recursive,
    iff, iffNot,
} from "../src/fluentBuilder";

import * as pre from "../src/Predefined";

const add = str("+").parser;
const sub = str("-").parser;
const mult = str("*").parser;
const div = str("/").parser;
const eq = str("==").parser;
const lessThan = str("<=").parser;
const grThan = str("=>").parser;

const trivia = pre.trivia.produce(Trivia);

function parseKeyword(word: string) {
    return trivia.followedBy(str(word)).produce(Keyword);
}
const ifKeyword = parseKeyword("if");
const thenKeyword = parseKeyword("then");
const elseKeyword = parseKeyword("else");
const letKeyword = parseKeyword("let");
const inKeyword = parseKeyword("in");
const fnKeyword = parseKeyword("fn");

const keyword = ifKeyword
    .or(thenKeyword)
    .or(elseKeyword)
    .or(letKeyword)
    .or(inKeyword)
    .or(fnKeyword);

function parseSymbol(sym: string) {
    return trivia.followedBy(str(sym)).produce(Symbol);
}

const eqSym = parseSymbol("=");
const openOval = parseSymbol("(");
const closeOval = parseSymbol(")");
const fnArrow = parseSymbol("=>");

const numLiteral = trivia.followedBy(pre.float).produce(NumLiteral);
const literal = numLiteral;
const id = trivia.followedBy(pre.identifier).produce(Identifier);

const boolPrescOperator = trivia.followedBy(eq).produce(Symbol);
const compPrescOperator = trivia.followedBy(either(lessThan).or(grThan)).produce(Symbol);
const addPrescOperator = trivia.followedBy(either(add).or(sub)).produce(Symbol);
const multPrescOperator = trivia.followedBy(either(mult).or(div)).produce(Symbol);

const recExp = recursive<Expression>();
const expression = builder<string, Expression>(recExp);

const literalExpression = literal.produce(LiteralExpression);
const funcExpression = fnKeyword
    .followedBy(id)
    .followedBy(fnArrow)
    .followedBy(expression)
    .produce(FuncExpression);
const identifierExpression = iffNot(keyword.parser).then(startsWith(id.parser).produce(IdentifierExpression));
// const identifierExpression = startsWith(id.parser).produce(IdentifierExpression);

const atomExpression = either<Expression>(literalExpression).or(funcExpression).or(identifierExpression);

// const callExpression = either<Expression>(atomExpression.followedBy(expression).produce(CallExpression)).or(atomExpression);
const callExpression = either<Expression>(identifierExpression.followedBy(expression).produce(CallExpression)).or(atomExpression);
const multExpression = pre.binary(callExpression, multPrescOperator, BinaryExpression);
const addExpression = pre.binary(multExpression, addPrescOperator, BinaryExpression);
const compExpression = pre.binary(addExpression, compPrescOperator, BinaryExpression);
const boolExpression = pre.binary(compExpression, boolPrescOperator, BinaryExpression);
const arithmeticExpression = boolExpression;

const ifExpression = ifKeyword
    .followedBy(expression)
    .followedBy(thenKeyword)
    .followedBy(expression)
    .followedBy(elseKeyword)
    .followedBy(expression)
    .produce(IfExpression);

const declaration = letKeyword.followedBy(id).followedBy(eqSym).followedBy(expression).produce(LetDeclaration);
const letExpression = declaration.atLeastOne()
    .followedBy(inKeyword)
    .followedBy(expression)
    .produce(LetExpression);

const parenthesisExpression = openOval.followedBy(expression).followedBy(closeOval).produce(ParenthesisExpression);
const actualExpression = either<Expression>(ifExpression)
    .or(letExpression)
    .or(parenthesisExpression)
    .or(arithmeticExpression);

recExp.set(actualExpression);

const te = recursive<Expression>();
const tCall = builder<string, Expression>(identifierExpression).followedBy(te).produce(CallExpression);
te.set(either<Expression>(tCall).or(identifierExpression));

export const parser = expression;
// export const parser = iffNot<string>(str("foo")).then(id);
export default function parseString(source: string) {
    return parser.parse(stringInput(source));
}
