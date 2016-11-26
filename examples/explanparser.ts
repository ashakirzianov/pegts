import { Parser } from "../src/core";
import {
    Trivia, Special,
    Expression, BinaryExpression, LiteralExpression,
} from "./explan";
import {
    either, parse, many, atLeastOne,
    prefix, startsWith,
    recursive,
} from "../src/builder";

const whiteSpace = prefix(" ");

const digit: Parser<string, string> = startsWith("0").or("1").or("2").or("3").or("4").or("5").or("6").or("7").or("8").or("9");

const add = prefix("+");
const sub = prefix("-");
const mult = prefix("*");
const div = prefix("/");

const trivia = parse(many(whiteSpace)).produce(Trivia);

const numLiteral = atLeastOne(digit);
const literal = numLiteral;

const addPrescOperator = parse(trivia)
    .then(either(add).or(sub))
    .produce(Special);

const multPrescOperator = parse(trivia)
    .then(either(mult).or(div))
    .produce(Special);

const expression = recursive<Expression>();
// const multExpression = parse(literal)
//     .then(multPrescOperator)
//     .then(literal)
//     .produce(BinaryExpression);