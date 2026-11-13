import dotenv from "dotenv";
import mongoose from "mongoose";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { companies, jobs } from "./career-data.js";

dotenv.config();

const applyChanges = process.argv.includes("--apply");
const recruiterEmail = process.env.SEED_RECRUITER_EMAIL?.trim().toLowerCase();

const run = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI must be configured in backend/.env.");
    }
    if (!recruiterEmail) {
        throw new Error("Set SEED_RECRUITER_EMAIL to the recruiter's email before running this script.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    const recruiter = await User.findOne({ email: recruiterEmail }).select("_id role");
    if (!recruiter || recruiter.role !== "recruiter") {
        throw new Error("The configured email must belong to an existing recruiter account.");
    }

    const companyRecords = new Map();
    const companyUpdatesByName = new Map();
    let companyCreates = 0;
    let companyUpdates = 0;

    for (const companyData of companies) {
        const existing = await Company.findOne({ name: companyData.name });
        if (existing && String(existing.userId) !== String(recruiter._id)) {
            throw new Error(`${companyData.name} already belongs to a different recruiter; no data was seeded.`);
        }

        companyRecords.set(companyData.name, existing);
        if (!existing) {
            companyCreates += 1;
            continue;
        }
        const missingFields = Object.fromEntries(
            Object.entries(companyData).filter(([field, value]) => {
                const currentValue = existing[field];
                return value && (currentValue === undefined || currentValue === null || currentValue === "");
            })
        );
        if (Object.keys(missingFields).length) {
            companyUpdates += 1;
            companyUpdatesByName.set(companyData.name, missingFields);
        }
    }

    const jobsToCreate = [];
    for (const jobData of jobs) {
        const existingCompany = companyRecords.get(jobData.company);
        const existing = existingCompany
            ? await Job.findOne({ company: existingCompany._id, title: jobData.title })
            : null;
        if (existing) continue;

        jobsToCreate.push(jobData);
    }

    if (applyChanges) {
        for (const companyData of companies) {
            const existing = companyRecords.get(companyData.name);
            if (!existing) {
                const created = await Company.create({ ...companyData, userId: recruiter._id });
                companyRecords.set(companyData.name, created);
                continue;
            }

            const missingFields = companyUpdatesByName.get(companyData.name);
            if (missingFields) {
                await Company.updateOne({ _id: existing._id, userId: recruiter._id }, { $set: missingFields });
            }
        }

        for (const jobData of jobsToCreate) {
            const company = companyRecords.get(jobData.company);
            if (!company) throw new Error(`Could not create or resolve company "${jobData.company}".`);
            await Job.create({
                ...jobData,
                company: company._id,
                created_by: recruiter._id,
                workMode: "",
                benefits: [],
            });
        }
    }

    console.log(`${applyChanges ? "Applied" : "Dry run"}: ${companyCreates} companies to create, ${companyUpdates} existing companies to enrich, ${jobsToCreate.length} jobs to create.`);
};

try {
    await run();
} catch (error) {
    console.error(`Career data seed failed: ${error.message}`);
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}
