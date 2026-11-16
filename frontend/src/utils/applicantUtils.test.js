import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { filterApplications } from './applicantUtils.js';

describe('applicant filtering', () => {
    const applications = [
        { status: 'pending', applicant: { fullname: 'Asha Rao', email: 'asha@example.com', phoneNumber: 12345 } },
        { status: 'accepted', applicant: { fullname: 'Ravi Shah', email: 'ravi@example.com', phoneNumber: 67890 } },
        { status: 'withdrawn', applicant: null },
    ];

    it('searches applicant name, email, and phone number', () => {
        assert.equal(filterApplications(applications, 'asha')[0], applications[0]);
        assert.equal(filterApplications(applications, 'RAVI@EXAMPLE')[0], applications[1]);
        assert.equal(filterApplications(applications, '6789')[0], applications[1]);
    });

    it('filters statuses case-insensitively and safely handles missing applicant profiles', () => {
        assert.deepEqual(filterApplications(applications, '', 'ACCEPTED'), [applications[1]]);
        assert.deepEqual(filterApplications(applications, 'missing', 'all'), []);
        assert.deepEqual(filterApplications(applications, '', 'withdrawn'), [applications[2]]);
    });
});
