export const WITHDRAWAL_WINDOW_MS = 24 * 60 * 60 * 1000;

export const isWithinWithdrawalWindow = (createdAt, now = Date.now()) => {
    const submittedAt = new Date(createdAt).getTime();
    return Number.isFinite(submittedAt) && submittedAt <= now && now - submittedAt <= WITHDRAWAL_WINDOW_MS;
};
