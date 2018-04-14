# pegts
TypeScript library for writing combinatory parsers based on peg-like operators using fluent builder syntax.
Wasn't really intended for real use and was developed purely for fun.

## Installation

JavaScript:

`npm install --save pegts`

TypeScript:

`npm install --save pegts @types/pegts`

## Usage:

```typescript
import { Parse, Str } from '../src/index';

type Expression = LiteralExpression | OperatorExpression;
type LiteralExpression = { literal: number };
type OperatorExpression = {
    left: Expression,
    rest: Array<{ op: string, exp: Expression }>,
};

const decimal = Str.reg(/[0-9]+/).map(s => parseInt(s, 10));
const addSub = Str.str("+").or("-").generic();
const multDiv = Str.str("*").or("/").generic();
const leftPar = Str.str("(").generic();
const rightPar = Str.str(")").generic();

const mathExpression = Parse.recursive<string, Expression>();

const literalExpression = decimal
    .map(d => ({ literal: d }));
const prodExpression = literalExpression
    .followedBy(
        multDiv
            .followedBy(literalExpression)
            .map((op, exp) => ({ op, exp }))
            .anyNumber())
    .map((left, rest) => ({ left, rest }));

const addExpression = prodExpression
    .followedBy(
        multDiv
            .followedBy(prodExpression)
            .map((op, exp) => ({ op, exp }))
            .anyNumber())
    .map((left, rest) => ({ left, rest }));

const parExpression = leftPar
    .followedBy(mathExpression)
    .followedBy(rightPar)
    .map((l, e, r) => e);

mathExpression.set(parExpression.or(addExpression));
```
