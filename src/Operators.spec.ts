import { expect } from "chai";
import parse from "./TestHelpers";
import * as op from "./Operators";
import { prefix } from "./StringBuilder";

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
