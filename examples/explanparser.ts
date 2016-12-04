import { Parser } from "../src/Core";
// import {
//     Trivia, Symbol, Keyword,
//     Expression, BinaryExpression, LiteralExpression, IfExpression, LetExpression, IdentifierExpression, ParenthesisExpression,
//     FuncExpression, CallExpression,
//     LetDeclaration, NumLiteral, BoolLiteral, StringLiteral, Identifier,
// } from "./explan";
import * as explan from "./explan";
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

const trivia = pre.trivia.produce(explan.Trivia);

function parseKeyword(word: string) {
    return trivia.followedBy(str(word)).produce(explan.Keyword);
}
const ifKeyword = parseKeyword("if");
const thenKeyword = parseKeyword("then");
const elseKeyword = parseKeyword("else");
const letKeyword = parseKeyword("let");
const letfunKeyword = parseKeyword("letfun");
const inKeyword = parseKeyword("in");
const fnKeyword = parseKeyword("fn");

const keyword = ifKeyword
    .or(thenKeyword)
    .or(elseKeyword)
    .or(letKeyword)
    .or(inKeyword)
    .or(fnKeyword);

function parseSymbol(sym: string) {
    return trivia.followedBy(str(sym)).produce(explan.Symbol);
}

const eqSym = parseSymbol("=");
const openOval = parseSymbol("(");
const closeOval = parseSymbol(")");
const fnArrow = parseSymbol("=>");

const numLiteral = trivia.followedBy(pre.float).produce(explan.NumLiteral);
const literal = numLiteral;
const id = trivia.followedBy(pre.identifier).produce(explan.Identifier);

const boolPrescOperator = trivia.followedBy(eq).produce(explan.Symbol);
const compPrescOperator = trivia.followedBy(either(lessThan).or(grThan)).produce(explan.Symbol);
const addPrescOperator = trivia.followedBy(either(add).or(sub)).produce(explan.Symbol);
const multPrescOperator = trivia.followedBy(either(mult).or(div)).produce(explan.Symbol);

const recExp = recursive<explan.Expression>();
const expression = builder<string, explan.Expression>(recExp);

const literalExpression = literal.produce(explan.LiteralExpression);
const namedFuncExpression = fnKeyword
    .followedBy(id)
    .followedBy(id)
    .followedBy(fnArrow)
    .followedBy(expression)
    .produce(explan.NamedFuncExpression);
const anonymousFuncExpression = id
    .followedBy(fnArrow)
    .followedBy(expression)
    .produce(explan.AnonymousFuncExpression);
const identifierExpression = iffNot(keyword.parser).then(startsWith(id.parser).produce(explan.IdentifierExpression));
// const identifierExpression = startsWith(id.parser).produce(IdentifierExpression);

const atomExpression = either<explan.Expression>(literalExpression)
    .or(namedFuncExpression)
    .or(anonymousFuncExpression)
    .or(identifierExpression);

// const callExpression = either<Expression>(atomExpression.followedBy(expression).produce(CallExpression)).or(atomExpression);
const callExpression = either<explan.Expression>(identifierExpression.followedBy(expression).produce(explan.CallExpression)).or(atomExpression);
const multExpression = pre.binary(callExpression, multPrescOperator, explan.BinaryExpression);
const addExpression = pre.binary(multExpression, addPrescOperator, explan.BinaryExpression);
const compExpression = pre.binary(addExpression, compPrescOperator, explan.BinaryExpression);
const boolExpression = pre.binary(compExpression, boolPrescOperator, explan.BinaryExpression);
const arithmeticExpression = boolExpression;

const ifExpression = ifKeyword
    .followedBy(expression)
    .followedBy(thenKeyword)
    .followedBy(expression)
    .followedBy(elseKeyword)
    .followedBy(expression)
    .produce(explan.IfExpression);

const valDeclaration = letKeyword
    .followedBy(id)
    .followedBy(eqSym)
    .followedBy(expression)
    .produce(explan.LetValDeclaration);
const funDeclaration = letfunKeyword
    .followedBy(id)
    .followedBy(id)
    .followedBy(eqSym)
    .followedBy(expression)
    .produce(explan.LetFuncDeclaration);
const declaration = either<explan.LetDeclaration>(valDeclaration).or(funDeclaration);
const letExpression = declaration.atLeastOne()
    .followedBy(inKeyword)
    .followedBy(expression)
    .produce(explan.LetExpression);

const parenthesisExpression = openOval.followedBy(expression).followedBy(closeOval).produce(explan.ParenthesisExpression);
const actualExpression = either<explan.Expression>(ifExpression)
    .or(letExpression)
    .or(parenthesisExpression)
    .or(arithmeticExpression);

recExp.set(actualExpression);

const te = recursive<explan.Expression>();
const tCall = builder<string, explan.Expression>(identifierExpression).followedBy(te).produce(explan.CallExpression);
te.set(either<explan.Expression>(tCall).or(identifierExpression));

export const parser = expression;
// export const parser = iffNot<string>(str("foo")).then(id);
export default function parseString(source: string) {
    return parser.parse(stringInput(source));
}
