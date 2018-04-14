import { Parse, Str } from '../src/index';

type Expression = LiteralExpression | OperatorExpression;
type LiteralExpression = { literal: number };
type OperatorExpression = {
    left: Expression,
    rest: Array<{ op: string, exp: Expression }>,
};

const decimal = Str.reg(/[0-9]+/).adopt(s => parseInt(s, 10));
const addSub = Str.str("+").or("-").generic();
const multDiv = Str.str("*").or("/").generic();
const leftPar = Str.str("(").generic();
const rightPar = Str.str(")").generic();

const mathExpression = Parse.recursive<string, Expression>();

const literalExpression = decimal
    .adopt(d => ({ literal: d }));
const prodExpression = literalExpression
    .followedBy(
        multDiv
            .followedBy(literalExpression)
            .adopt((op, exp) => ({ op, exp }))
            .anyNumber())
    .adopt((left, rest) => ({ left, rest }));

const addExpression = prodExpression
    .followedBy(
        multDiv
            .followedBy(prodExpression)
            .adopt((op, exp) => ({ op, exp }))
            .anyNumber())
    .adopt((left, rest) => ({ left, rest }));

const parExpression = leftPar
    .followedBy(mathExpression)
    .followedBy(rightPar)
    .adopt((l, e, r) => e);

mathExpression.set(parExpression.or(addExpression));
