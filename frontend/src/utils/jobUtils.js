const normalize = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

export const matchesJobSearch = (job, query) => {
    const searchTerms = normalize(query).split(' ').filter(Boolean);
    if (!searchTerms.length) return true;

    const searchableText = normalize(`${job?.title || ''} ${job?.description || ''} ${job?.location || ''} ${job?.company?.name || ''}`);
    return searchTerms.every(searchTerm => searchableText.includes(searchTerm));
};

export const getJobSearchSuggestions = (jobs, query, field = 'role') => {
    const searchTerm = normalize(query);
    if (!searchTerm) return [];

    const candidates = jobs.flatMap(job => field === 'location'
        ? [job?.location]
        : [job?.title, job?.company?.name]);

    return [...new Set(candidates
        .map(value => String(value || '').trim())
        .filter(value => normalize(value).includes(searchTerm)))]
        .slice(0, 6);
};

const matchesModeValue = (value, selectedMode) => {
    const mode = normalize(value);
    const aliases = {
        'on-site': ['on-site', 'onsite', 'in-office', 'office'],
        remote: ['remote', 'work from home', 'wfh'],
    };

    return (aliases[selectedMode] || [selectedMode]).includes(mode);
};

export const matchesWorkMode = (job, filter) => {
    const selectedMode = normalize(filter);
    if (!selectedMode || selectedMode === 'any') return true;

    const workMode = normalize(job?.workMode);
    if (workMode) return matchesModeValue(workMode, selectedMode);

    return [job?.jobType, job?.location].some(value => matchesModeValue(value, selectedMode));
};

export const getMinimumAnnualSalary = (value) => {
    const raw = String(value || '').replace(/,/g, '');
    const values = raw.match(/\d+(?:\.\d+)?/g)?.map(Number) || [];
    if (!values.length) return 0;

    return Math.min(...values) * (/\blpa\b/i.test(raw) || values[0] < 1000 ? 100000 : 1);
};

export const sortJobs = (jobs, sortOrder = 'relevance') => [...jobs].sort((first, second) => {
    if (sortOrder === 'newest') {
        const firstDate = Date.parse(first?.createdAt) || 0;
        const secondDate = Date.parse(second?.createdAt) || 0;
        return secondDate - firstDate;
    }
    if (sortOrder === 'salary') {
        return getMinimumAnnualSalary(second?.salary) - getMinimumAnnualSalary(first?.salary);
    }
    return 0;
});

export const formatSalary = (value) => {
    const salary = String(value || '').trim();
    if (!salary) return 'Salary not specified';

    const formattedSalary = /₹|INR|Rs\.?/i.test(salary) ? salary : `₹${salary}`;
    return /\blpa\b/i.test(salary) ? formattedSalary : `${formattedSalary} LPA`;
};
