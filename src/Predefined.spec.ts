import { expect } from "chai";
import * as pre from "./Predefined";
import expectParser from "./TestHelpers";

describe("Predefined", () => {
    it("whitespace", () => {
        expectParser(pre.whiteSpace).against("\n").toMatch();
        expectParser(pre.whiteSpace).against("\r").toMatch();
        expectParser(pre.whiteSpace).against("\t").toMatch();
    });
});
