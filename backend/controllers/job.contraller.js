import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { User } from "../models/user.model.js";

// admin post krega job
export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId, workMode, benefits, applicationDeadline } = req.body;
        const userId = req.id;

        const user = await User.findById(userId).select("role");
        if (!user || user.role !== "recruiter") {
            return res.status(403).json({ message: "Recruiter access required.", success: false });
        }

        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({
                message: "Somethin is missing.",
                success: false
            })
        };
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
            requirements: requirements.split(",").map((r) => r.trim()).filter(Boolean),
            salary: String(salary).trim(), // keep as-is so ranges like "6-12" save correctly
            location,
            jobType,
            experienceLevel: String(experience).trim(), // e.g. "0-2"
            workMode: String(workMode || "").trim(),
            benefits: String(benefits || "").split(",").map((benefit) => benefit.trim()).filter(Boolean),
            applicationDeadline: parsedDeadline,
            position,
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

        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({ message: "Somethin is missing.", success: false });
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
        job.requirements = requirements.split(",").map((requirement) => requirement.trim()).filter(Boolean);
        job.salary = String(salary).trim();
        job.location = location;
        job.jobType = jobType;
        job.experienceLevel = String(experience).trim();
        job.workMode = String(workMode || "").trim();
        job.benefits = String(benefits || "").split(",").map((benefit) => benefit.trim()).filter(Boolean);
        job.applicationDeadline = parsedDeadline;
        job.position = position;
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
// student k liye
export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ]
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
        const job = await Job.findById(jobId)
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
