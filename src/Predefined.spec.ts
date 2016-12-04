import { expect } from "chai";
import * as pre from "./Predefined";
import parse from "./TestHelpers";

describe("Predefined", () => {
    it("whitespace", () => {
        parse(pre.whiteSpace).against("\n").shouldMatch();
        parse(pre.whiteSpace).against("\r").shouldMatch();
        parse(pre.whiteSpace).against("\t").shouldMatch();
    });
});
