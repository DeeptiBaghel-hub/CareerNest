import mongoose from "mongoose";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { User } from "../models/user.model.js";
import { buildJobSearchFilter, escapeRegex, tokenizeJobSearch } from "../utils/jobSearch.js";

const parseList = (value) => {
    const values = Array.isArray(value) ? value : String(value || "").split(",");
    return values.map((item) => String(item).trim()).filter(Boolean);
};
const hasText = (value) => String(value ?? "").trim().length > 0;

// admin post krega job
export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId, workMode, benefits, applicationDeadline } = req.body;
        const userId = req.id;

        const user = await User.findById(userId).select("role");
        if (!user || user.role !== "recruiter") {
            return res.status(403).json({ message: "Recruiter access required.", success: false });
        }

        const parsedPosition = Number(position);
        if (![title, description, salary, location, jobType, experience].every(hasText)) {
            return res.status(400).json({
                message: "Please complete all required job fields.",
                success: false
            })
        };
        if (!Number.isInteger(parsedPosition) || parsedPosition < 1) {
            return res.status(400).json({ message: "Number of positions must be at least 1.", success: false });
        }
        if (!mongoose.isValidObjectId(companyId)) {
            return res.status(400).json({ message: "Please select a valid company.", success: false });
        }
        const parsedDeadline = applicationDeadline ? new Date(applicationDeadline) : undefined;
        if (applicationDeadline && Number.isNaN(parsedDeadline.getTime())) {
            return res.status(400).json({
                message: "Please provide a valid application deadline.",
                success: false
            });
        }
        const company = await Company.findOne({ _id: companyId, userId });
        if (!company) {
            return res.status(403).json({ message: "You can only post jobs for your own company.", success: false });
        }
        const job = await Job.create({
            title,
            description,
            requirements: parseList(requirements),
            salary: String(salary).trim(), // keep as-is so ranges like "6-12" save correctly
            location,
            jobType,
            experienceLevel: String(experience).trim(), // e.g. "0-2"
            workMode: String(workMode || "").trim(),
            benefits: String(benefits || "").split(",").map((benefit) => benefit.trim()).filter(Boolean),
            applicationDeadline: parsedDeadline,
            position: parsedPosition,
            company: companyId,
            created_by: userId
        });
        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong while creating the job.",
            success: false
        });
    }
}

export const updateJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId, workMode, benefits, applicationDeadline } = req.body;
        const userId = req.id;
        const user = await User.findById(userId).select("role");
        if (!user || user.role !== "recruiter") {
            return res.status(403).json({ message: "Recruiter access required.", success: false });
        }

        const parsedPosition = Number(position);
        if (![title, description, salary, location, jobType, experience].every(hasText)) {
            return res.status(400).json({ message: "Please complete all required job fields.", success: false });
        }
        if (!Number.isInteger(parsedPosition) || parsedPosition < 1) {
            return res.status(400).json({ message: "Number of positions must be at least 1.", success: false });
        }
        if (!mongoose.isValidObjectId(req.params.id) || !mongoose.isValidObjectId(companyId)) {
            return res.status(400).json({ message: "Please provide a valid job and company.", success: false });
        }
        const parsedDeadline = applicationDeadline ? new Date(applicationDeadline) : null;
        if (applicationDeadline && Number.isNaN(parsedDeadline.getTime())) {
            return res.status(400).json({
                message: "Please provide a valid application deadline.",
                success: false
            });
        }

        const job = await Job.findOne({ _id: req.params.id, created_by: userId });
        if (!job) {
            return res.status(404).json({ message: "Job not found.", success: false });
        }
        const company = await Company.findOne({ _id: companyId, userId });
        if (!company) {
            return res.status(403).json({ message: "You can only post jobs for your own company.", success: false });
        }

        job.title = title;
        job.description = description;
        job.requirements = parseList(requirements);
        job.salary = String(salary).trim();
        job.location = location;
        job.jobType = jobType;
        job.experienceLevel = String(experience).trim();
        job.workMode = String(workMode || "").trim();
        job.benefits = String(benefits || "").split(",").map((benefit) => benefit.trim()).filter(Boolean);
        job.applicationDeadline = parsedDeadline;
        job.position = parsedPosition;
        job.company = companyId;
        await job.save();

        return res.status(200).json({
            message: "Job updated successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong while updating the job.",
            success: false
        });
    }
}

export const archiveJob = async (req, res) => {
    try {
        const user = await User.findById(req.id).select("role");
        if (!user || user.role !== "recruiter") {
            return res.status(403).json({ message: "Recruiter access required.", success: false });
        }
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Please provide a valid job id.", success: false });
        }

        const job = await Job.findOne({ _id: req.params.id, created_by: req.id });
        if (!job) {
            return res.status(404).json({ message: "Job not found.", success: false });
        }

        if (!job.isArchived) {
            job.isArchived = true;
            job.archivedAt = new Date();
            await job.save();
        }
        return res.status(200).json({
            message: "Job archived. Its applications are kept in history.",
            job,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong while archiving the job.", success: false });
    }
};

export const restoreJob = async (req, res) => {
    try {
        const user = await User.findById(req.id).select("role");
        if (!user || user.role !== "recruiter") {
            return res.status(403).json({ message: "Recruiter access required.", success: false });
        }
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Please provide a valid job id.", success: false });
        }

        const job = await Job.findOne({ _id: req.params.id, created_by: req.id });
        if (!job) {
            return res.status(404).json({ message: "Job not found.", success: false });
        }

        job.isArchived = false;
        job.archivedAt = null;
        await job.save();
        return res.status(200).json({ message: "Job restored.", job, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong while restoring the job.", success: false });
    }
};

// student k liye
export const getAllJobs = async (req, res) => {
    try {
        const searchTerms = tokenizeJobSearch(req.query.keyword);
        const matchingCompanies = searchTerms.length
            ? await Company.find({
                $or: searchTerms.map((term) => ({
                    name: { $regex: escapeRegex(term), $options: "i" },
                })),
            }).select("_id name").lean()
            : [];
        const query = {
            ...buildJobSearchFilter(searchTerms, matchingCompanies),
            isArchived: { $ne: true },
        };
        const jobs = await Job.find(query).populate({
            path: "company"
        }).sort({ createdAt: -1 });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong while fetching jobs.",
            success: false
        });
    }
}
// student
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        if (!mongoose.isValidObjectId(jobId)) {
            return res.status(400).json({ message: "Please provide a valid job id.", success: false });
        }
        const job = await Job.findOne({ _id: jobId, isArchived: { $ne: true } })
            .populate({ path: "company" })
            .populate({ path: "applications" });
        if (!job) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong while fetching the job.",
            success: false
        });
    }
}
// admin kitne job create kra hai abhi tk
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({ created_by: adminId })
            .populate({ path: 'company' })
            .sort({ createdAt: -1 });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong while fetching admin jobs.",
            success: false
        });
    }
}
