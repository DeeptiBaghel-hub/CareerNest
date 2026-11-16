const normalize = (value) => String(value || '').trim().toLowerCase();

export const filterApplications = (applications = [], query = '', status = 'all') => {
    const searchTerm = normalize(query);
    const selectedStatus = normalize(status);

    return applications.filter(application => {
        const applicationStatus = normalize(application?.status || 'pending');
        const applicant = application?.applicant;
        const searchableText = normalize([
            applicant?.fullname,
            applicant?.email,
            applicant?.phoneNumber,
        ].join(' '));

        return (selectedStatus === 'all' || applicationStatus === selectedStatus)
            && (!searchTerm || searchableText.includes(searchTerm));
    });
};
