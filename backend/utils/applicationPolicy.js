export const WITHDRAWAL_WINDOW_MS = 24 * 60 * 60 * 1000;

export const isWithinWithdrawalWindow = (createdAt, now = Date.now()) => {
    const submittedAt = new Date(createdAt).getTime();
    return Number.isFinite(submittedAt) && submittedAt <= now && now - submittedAt <= WITHDRAWAL_WINDOW_MS;
};

export const isApplicationDeadlineOpen = (deadline, now = Date.now()) => {
    if (deadline === undefined || deadline === null || deadline === "") return true;
    const deadlineTime = new Date(deadline).getTime();
    return Number.isFinite(deadlineTime) && deadlineTime >= now;
};

export const parseApplicationDeadline = (value) => {
    if (!value) return undefined;
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const deadline = new Date(`${value}T23:59:59.999Z`);
        if (!Number.isFinite(deadline.getTime()) || deadline.toISOString().slice(0, 10) !== value) return null;
        return deadline;
    }

    const deadline = new Date(value);
    return Number.isFinite(deadline.getTime()) ? deadline : null;
};

export const buildOpenJobsFilter = (now = new Date()) => ({
    isArchived: { $ne: true },
    $or: [
        { applicationDeadline: { $exists: false } },
        { applicationDeadline: null },
        { applicationDeadline: { $gt: now } },
    ],
});
