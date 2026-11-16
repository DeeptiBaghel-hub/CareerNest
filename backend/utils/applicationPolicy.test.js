import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    buildOpenJobsFilter,
    isApplicationDeadlineOpen,
    isWithinWithdrawalWindow,
    parseApplicationDeadline,
    WITHDRAWAL_WINDOW_MS,
} from "./applicationPolicy.js";

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

    it("keeps a date-only application deadline open through the full selected date", () => {
        const deadline = parseApplicationDeadline("2026-11-16");
        assert.equal(deadline.toISOString(), "2026-11-16T23:59:59.999Z");
        assert.equal(isApplicationDeadlineOpen(deadline, Date.parse("2026-11-16T12:00:00Z")), true);
        assert.equal(isApplicationDeadlineOpen(deadline, Date.parse("2026-11-17T00:00:00Z")), false);
    });

    it("rejects malformed deadlines and invalid calendar dates", () => {
        assert.equal(parseApplicationDeadline("not-a-date"), null);
        assert.equal(parseApplicationDeadline("2026-02-30"), null);
        assert.equal(parseApplicationDeadline("2026-13-01"), null);
        assert.equal(isApplicationDeadlineOpen("not-a-date"), false);
    });

    it("includes only unarchived jobs without a deadline or with a future deadline", () => {
        const now = new Date("2026-11-16T12:00:00Z");
        assert.deepEqual(buildOpenJobsFilter(now), {
            isArchived: { $ne: true },
            $or: [
                { applicationDeadline: { $exists: false } },
                { applicationDeadline: null },
                { applicationDeadline: { $gt: now } },
            ],
        });
    });
});
