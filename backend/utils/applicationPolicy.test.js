import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isWithinWithdrawalWindow, WITHDRAWAL_WINDOW_MS } from "./applicationPolicy.js";

describe("application withdrawal policy", () => {
    it("allows withdrawal through the 24-hour boundary", () => {
        const now = Date.now();
        assert.equal(isWithinWithdrawalWindow(now - WITHDRAWAL_WINDOW_MS, now), true);
    });

    it("rejects withdrawal after the 24-hour boundary, for future dates, or invalid dates", () => {
        const now = Date.now();
        assert.equal(isWithinWithdrawalWindow(now - WITHDRAWAL_WINDOW_MS - 1, now), false);
        assert.equal(isWithinWithdrawalWindow(now + 1, now), false);
        assert.equal(isWithinWithdrawalWindow("not a date", now), false);
    });
});
