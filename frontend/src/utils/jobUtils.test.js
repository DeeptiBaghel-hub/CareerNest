import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatSalary, getMinimumAnnualSalary, matchesJobSearch, matchesWorkMode } from './jobUtils.js';

describe('job display and filter helpers', () => {
    it('matches job searches across title, location, and company', () => {
        const job = { title: 'Java Developer', location: 'Hyderabad', company: { name: 'Wipro' } };
        assert.equal(matchesJobSearch(job, 'wipro'), true);
        assert.equal(matchesJobSearch(job, 'hyderabad'), true);
        assert.equal(matchesJobSearch(job, 'Java Hyderabad'), true);
        assert.equal(matchesJobSearch(job, 'designer'), false);
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
});
