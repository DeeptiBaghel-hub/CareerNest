import mongoose from "mongoose";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const registerCompany = async (req, res) => {
    try {
        const { companyName } = req.body;
        if (!companyName) {
            return res.status(400).json({
                message: "Company name is required.",
                success: false
            });
        }

        let company = await Company.findOne({ name: companyName });
        if (company) {
            return res.status(400).json({
                message: "You can't register the same company.",
                success: false
            });
        }

        let logo = "";
        if (req.file) {
            const fileUri = getDataUri(req.file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            logo = cloudResponse.secure_url;
        }

        company = await Company.create({
            name: companyName,
            userId: req.id,
            logo
        });

        return res.status(201).json({
            message: "Company registered successfully.",
            company,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong while registering the company.",
            success: false
        });
    }
};

export const getCompany = async (req, res) => {
    try {
        const userId = req.id; // logged in user id
        const companies = await Company.find({ userId });
        // An empty list is a normal, valid result for a recruiter who hasn't
        // registered a company yet — it's not an error. Returning 404 here
        // made the frontend's fetch throw, so on any transient failure the
        // UI silently kept showing stale/no data instead of the real list.
        return res.status(200).json({
            companies,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong while fetching companies.",
            success: false
        });
    }
};

// get company by id
export const getCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id;
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            });
        }
        return res.status(200).json({
            company,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong while fetching the company.",
            success: false
        });
    }
};

export const updateCompany = async (req, res) => {
    try {
        const { name, description, website, location, industry, companySize, founded, companyType, specializations } = req.body;
        const updateData = { name, description, website, location };
        if (industry !== undefined) updateData.industry = industry;
        if (companySize !== undefined) updateData.companySize = companySize;
        if (founded !== undefined) {
            const parsedFounded = String(founded).trim() ? Number(founded) : null;
            if (parsedFounded !== null && (!Number.isInteger(parsedFounded) || parsedFounded < 1)) {
                return res.status(400).json({
                    message: "Please provide a valid founding year.",
                    success: false
                });
            }
            updateData.founded = parsedFounded;
        }
        if (companyType !== undefined) updateData.companyType = companyType;
        if (specializations !== undefined) {
            updateData.specializations = String(specializations || "")
                .split(",")
                .map((specialization) => specialization.trim())
                .filter(Boolean);
        }

        if (req.file) {
            const fileUri = getDataUri(req.file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            updateData.logo = cloudResponse.secure_url;
        }

        const company = await Company.findOneAndUpdate({ _id: req.params.id, userId: req.id }, updateData, { new: true, runValidators: true });
        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            });
        }
        return res.status(200).json({
            message: "Company information updated.",
            company,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong while updating the company.",
            success: false
        });
    }
};

export const deleteCompany = async (req, res) => {
    try {
        const user = await User.findById(req.id).select("role");
        if (!user || user.role !== "recruiter") {
            return res.status(403).json({ message: "Recruiter access required.", success: false });
        }
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Please provide a valid company id.", success: false });
        }

        const company = await Company.findOne({ _id: req.params.id, userId: req.id });
        if (!company) {
            return res.status(404).json({ message: "Company not found.", success: false });
        }
        const hasJobs = await Job.exists({ company: company._id });
        if (hasJobs) {
            return res.status(409).json({
                message: "This company has linked jobs, including archived jobs. Its application history is retained, so the company cannot be deleted.",
                success: false
            });
        }

        await company.deleteOne();
        return res.status(200).json({ message: "Company deleted.", companyId: company._id, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong while deleting the company.", success: false });
    }
};
