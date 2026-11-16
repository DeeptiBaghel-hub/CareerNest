export const tokenizeJobSearch = (keyword) => String(keyword || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

export const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const buildJobSearchFilter = (tokens, companies = []) => {
    if (!tokens.length) return {};

    return {
        $and: tokens.map((token) => {
            const matchingCompanyIds = companies
                .filter((company) => String(company.name || "").toLowerCase().includes(token.toLowerCase()))
                .map((company) => company._id);

            return {
                $or: [
                    { title: { $regex: escapeRegex(token), $options: "i" } },
                    { description: { $regex: escapeRegex(token), $options: "i" } },
                    { location: { $regex: escapeRegex(token), $options: "i" } },
                    { workMode: { $regex: escapeRegex(token), $options: "i" } },
                    { jobType: { $regex: escapeRegex(token), $options: "i" } },
                    { company: { $in: matchingCompanyIds } },
                ],
            };
        }),
    };
};
