import { Parser } from "../src/core";
import {
    Trivia, Special,
    Expression, BinaryExpression,
    LiteralExpression, NumLiteral, BoolLiteral, StringLiteral,
} from "./explan";
import {
    startsWith,
    either, anyNumberOf, atLeastOne,
    string, recursive,
    stringInput,
} from "../src/builder";

const whiteSpace = string(" ").parser;

const digit = string("0").or("1").or("2").or("3").or("4").or("5").or("6").or("7").or("8").or("9").parser;
const number = atLeastOne(digit).reduce((acc, s) => acc + s, "");

const add = string("+").parser;
const sub = string("-").parser;
const mult = string("*").parser;
const div = string("/").parser;

const trivia = startsWith(anyNumberOf(whiteSpace).reduce((acc, s) => acc + s, "").parser).produce(Trivia);

const numLiteral = startsWith(trivia).followedBy(number).produce(NumLiteral);
const literal = numLiteral;

const addPrescOperator = startsWith(trivia)
    .followedBy(either(add).or(sub))
    .produce(Special);

const multPrescOperator = startsWith(trivia)
    .followedBy(either(mult).or(div))
    .produce(Special);

const expression = recursive<Expression>();

const literalExpression = startsWith(literal).produce(LiteralExpression);
const multExpression = either<string, Expression>(
    startsWith(literalExpression)
    .followedBy(multPrescOperator)
    .followedBy(literalExpression)
    .produce(BinaryExpression))
    .or(literalExpression).parser;
const addExpression = either<string, Expression>(
    startsWith(multExpression)
    .followedBy(addPrescOperator)
    .followedBy(multExpression)
    .produce(BinaryExpression))
    .or(multExpression).parser;

expression.set(addExpression);

const parser = expression;
export default function parseString(source: string) {
    return parser.parse(stringInput(source));
}
