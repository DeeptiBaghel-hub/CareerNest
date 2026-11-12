const normalize = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

export const matchesJobSearch = (job, query) => {
    const searchTerm = normalize(query);
    if (!searchTerm) return true;

    return normalize(`${job?.title || ''} ${job?.description || ''} ${job?.location || ''} ${job?.company?.name || ''}`)
        .includes(searchTerm);
};

export const matchesWorkLocation = (job, filter) => {
    const selectedLocation = normalize(filter);
    if (!selectedLocation || selectedLocation === 'any') return true;

    const workMode = normalize(job?.workMode);
    if (workMode) {
        if (selectedLocation === 'remote') {
            return workMode.includes('remote') || workMode.includes('work from home') || workMode === 'wfh';
        }
        return workMode.includes(selectedLocation);
    }

    return normalize(`${job?.jobType || ''} ${job?.location || ''}`).includes(selectedLocation);
};

export const getMinimumAnnualSalary = (value) => {
    const raw = String(value || '').replace(/,/g, '');
    const values = raw.match(/\d+(?:\.\d+)?/g)?.map(Number) || [];
    if (!values.length) return 0;

    return Math.min(...values) * (/\blpa\b/i.test(raw) || values[0] < 1000 ? 100000 : 1);
};

export const formatSalary = (value) => {
    const salary = String(value || '').trim();
    if (!salary) return 'Salary not specified';

    const formattedSalary = /₹|INR|Rs\.?/i.test(salary) ? salary : `₹${salary}`;
    return /\blpa\b/i.test(salary) ? formattedSalary : `${formattedSalary} LPA`;
};
