import { expect } from 'chai';
import parse from './testHelpers';
import * as op from './operators';
import { prefix } from './stringBuilder';

describe("Operators", () => {
    const someParser = prefix("some");

    it("zeroMore", () => {
        const expectZeroMoreSome = parse(op.zeroMore(someParser));
        expectZeroMoreSome.against("some").shouldProduce(["some"]);
        expectZeroMoreSome.against("somesome").shouldProduce(["some", "some"]);
        expectZeroMoreSome.against("other").shouldProduce([]);
        expectZeroMoreSome.against("").shouldProduce([]);
    });
});
