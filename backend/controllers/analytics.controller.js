import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";

export const getRecruiterAnalytics = async (req, res) => {
    try {
        const userId = req.id;

        // Verify user is a recruiter
        const user = await User.findById(userId).select("role");
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        if (user.role !== "recruiter") {
            return res.status(403).json({ message: "Access denied. Recruiter role required.", success: false });
        }

        const recruiterObjectId = new mongoose.Types.ObjectId(userId);

        // Get all companies owned by this recruiter
        const companies = await Company.find({ userId: recruiterObjectId }).select("_id name");
        const companyIds = companies.map((c) => c._id);

        // Get all jobs created by this recruiter
        const jobs = await Job.find({ created_by: recruiterObjectId }).select(
            "_id title company isArchived applications"
        );
        const jobIds = jobs.map((j) => j._id);

        // ── Overview ──
        const totalCompanies = companies.length;
        const totalJobs = jobs.length;
        const activeJobs = jobs.filter((j) => !j.isArchived).length;
        const archivedJobs = jobs.filter((j) => j.isArchived).length;

        // Count applications by status in a single aggregation
        const statusCounts = await Application.aggregate([
            { $match: { job: { $in: jobIds } } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        const applicationsByStatus = { pending: 0, accepted: 0, rejected: 0, withdrawn: 0 };
        let totalApplications = 0;
        for (const s of statusCounts) {
            if (s._id in applicationsByStatus) {
                applicationsByStatus[s._id] = s.count;
            }
            totalApplications += s.count;
        }

        const overview = {
            totalCompanies,
            totalJobs,
            activeJobs,
            archivedJobs,
            totalApplications,
            pendingApplications: applicationsByStatus.pending,
            acceptedApplications: applicationsByStatus.accepted,
            rejectedApplications: applicationsByStatus.rejected,
            withdrawnApplications: applicationsByStatus.withdrawn,
        };

        // ── Applications per month (last 6 months) ──
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const applicationsPerMonthRaw = await Application.aggregate([
            {
                $match: {
                    job: { $in: jobIds },
                    createdAt: { $gte: sixMonthsAgo },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);

        // Build a full 6-month timeline (fill missing months with 0)
        const applicationsPerMonth = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = d.getFullYear();
            const month = d.getMonth() + 1; // 1-indexed
            const match = applicationsPerMonthRaw.find(
                (r) => r._id.year === year && r._id.month === month
            );
            applicationsPerMonth.push({
                month: `${year}-${String(month).padStart(2, "0")}`,
                count: match ? match.count : 0,
            });
        }

        // ── Jobs per company ──
        // Build a map: companyId → { jobCount, applicationCount }
        const companyMap = new Map();
        for (const c of companies) {
            companyMap.set(c._id.toString(), { companyName: c.name, jobCount: 0, applicationCount: 0 });
        }
        for (const j of jobs) {
            const key = j.company.toString();
            const entry = companyMap.get(key);
            if (entry) {
                entry.jobCount += 1;
                entry.applicationCount += j.applications ? j.applications.length : 0;
            }
        }
        const jobsPerCompany = Array.from(companyMap.values());

        // ── Recent applications (last 10) ──
        const recentApplications = await Application.find({ job: { $in: jobIds } })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate({ path: "applicant", select: "fullname email" })
            .populate({
                path: "job",
                select: "title company",
                populate: { path: "company", select: "name" },
            })
            .lean();

        const formattedRecentApplications = recentApplications.map((app) => ({
            applicantName: app.applicant?.fullname || "",
            applicantEmail: app.applicant?.email || "",
            jobTitle: app.job?.title || "",
            companyName: app.job?.company?.name || "",
            status: app.status,
            appliedAt: app.createdAt,
        }));

        // ── Top 5 jobs by application count ──
        const topJobs = await Job.aggregate([
            { $match: { created_by: recruiterObjectId } },
            {
                $lookup: {
                    from: "companies",
                    localField: "company",
                    foreignField: "_id",
                    as: "companyInfo",
                },
            },
            { $unwind: { path: "$companyInfo", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    title: 1,
                    companyName: "$companyInfo.name",
                    applicationCount: { $size: { $ifNull: ["$applications", []] } },
                },
            },
            { $sort: { applicationCount: -1 } },
            { $limit: 5 },
        ]);

        return res.status(200).json({
            success: true,
            analytics: {
                overview,
                applicationsPerMonth,
                jobsPerCompany,
                applicationsByStatus,
                recentApplications: formattedRecentApplications,
                topJobs: topJobs.map((j) => ({
                    title: j.title,
                    companyName: j.companyName || "",
                    applicationCount: j.applicationCount,
                })),
            },
        });
    } catch (error) {
        console.error("Analytics error:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};
