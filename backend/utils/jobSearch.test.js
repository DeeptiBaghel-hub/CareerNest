import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildJobSearchFilter, escapeRegex, tokenizeJobSearch } from "./jobSearch.js";

describe("job search query helpers", () => {
    it("splits search phrases into non-empty terms", () => {
        assert.deepEqual(tokenizeJobSearch("  React   Bengaluru "), ["React", "Bengaluru"]);
        assert.deepEqual(tokenizeJobSearch("   "), []);
    });

    it("treats punctuation in search terms literally", () => {
        assert.equal(escapeRegex("C++ (React)"), "C\\+\\+ \\(React\\)");
    });

    it("matches every term across role text, location, or matching company", () => {
        const filter = buildJobSearchFilter(
            ["React", "Noida"],
            [{ _id: "hcl-id", name: "HCLTech" }]
        );

        assert.equal(filter.$and.length, 2);
        assert.deepEqual(filter.$and[0].$or[5], { company: { $in: [] } });
        assert.deepEqual(filter.$and[1].$or[5], { company: { $in: [] } });

        const companyFilter = buildJobSearchFilter(
            ["React", "HCLTech"],
            [{ _id: "hcl-id", name: "HCLTech" }]
        );
        assert.deepEqual(companyFilter.$and[1].$or[5], { company: { $in: ["hcl-id"] } });
    });
});
