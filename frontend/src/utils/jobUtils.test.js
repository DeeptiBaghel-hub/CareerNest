import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatSalary, getJobSearchSuggestions, getMinimumAnnualSalary, matchesJobSearch, matchesWorkMode, sortJobs } from './jobUtils.js';

describe('job display and filter helpers', () => {
    it('matches job searches across title, location, and company', () => {
        const job = { title: 'Java Developer', location: 'Hyderabad', company: { name: 'Wipro' } };
        assert.equal(matchesJobSearch(job, 'wipro'), true);
        assert.equal(matchesJobSearch(job, 'hyderabad'), true);
        assert.equal(matchesJobSearch(job, 'Java Hyderabad'), true);
        assert.equal(matchesJobSearch(job, 'designer'), false);
    });

    it('suggests unique matching roles, companies, and locations from loaded jobs', () => {
        const jobs = [
            { title: 'Frontend Developer', location: 'Mumbai', company: { name: 'Acme' } },
            { title: 'Frontend Engineer', location: 'Mumbai', company: { name: 'Beta' } },
            { title: 'Designer', location: 'Pune', company: { name: 'Acme' } },
        ];
        assert.deepEqual(getJobSearchSuggestions(jobs, 'front'), ['Frontend Developer', 'Frontend Engineer']);
        assert.deepEqual(getJobSearchSuggestions(jobs, 'acme'), ['Acme']);
        assert.deepEqual(getJobSearchSuggestions(jobs, 'mum', 'location'), ['Mumbai']);
        assert.deepEqual(getJobSearchSuggestions(jobs, '', 'location'), []);
    });

    it('matches the selected work mode exactly instead of searching descriptions or overlapping modes', () => {
        assert.equal(matchesWorkMode({ workMode: 'Hybrid', description: 'Remote collaboration' }, 'hybrid'), true);
        assert.equal(matchesWorkMode({ workMode: 'Hybrid', description: 'Remote collaboration' }, 'remote'), false);
        assert.equal(matchesWorkMode({ workMode: 'Remote' }, 'remote'), true);
        assert.equal(matchesWorkMode({ workMode: 'Temporarily remote' }, 'remote'), false);
        assert.equal(matchesWorkMode({ workMode: 'Temporarily remote' }, 'temporarily remote'), true);
        assert.equal(matchesWorkMode({ workMode: 'On-site' }, 'on-site'), true);
    });

    it('uses location fields for older jobs without a work mode', () => {
        assert.equal(matchesWorkMode({ location: 'Temporarily Remote' }, 'temporarily remote'), true);
        assert.equal(matchesWorkMode({ location: 'Mumbai', description: 'Remote collaboration' }, 'remote'), false);
    });

    it('formats salary values without repeating the currency or pay unit', () => {
        assert.equal(formatSalary('₹3.5 – 6 LPA'), '₹3.5 – 6 LPA');
        assert.equal(formatSalary('5-9'), '₹5-9 LPA');
        assert.equal(formatSalary('8 LPA'), '₹8 LPA');
    });

    it('compares salary ranges using their lower bound', () => {
        assert.equal(getMinimumAnnualSalary('5-9'), 500000);
        assert.equal(getMinimumAnnualSalary('₹3.5 – 6 LPA'), 350000);
        assert.equal(getMinimumAnnualSalary('700000'), 700000);
    });

    it('sorts jobs by newest or salary without changing the original list', () => {
        const jobs = [
            { _id: 'older', createdAt: '2026-01-01', salary: '₹8 LPA' },
            { _id: 'newer', createdAt: '2026-02-01', salary: '₹3 LPA' },
        ];
        assert.deepEqual(sortJobs(jobs, 'newest').map(job => job._id), ['newer', 'older']);
        assert.deepEqual(sortJobs(jobs, 'salary').map(job => job._id), ['older', 'newer']);
        assert.deepEqual(jobs.map(job => job._id), ['older', 'newer']);
    });
});
