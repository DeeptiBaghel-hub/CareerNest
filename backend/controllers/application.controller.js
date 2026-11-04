import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";

export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).select("role");
        if (!user || user.role !== "student") {
            return res.status(403).json({ message: "Student access required.", success: false });
        }
        const jobId = req.params.id;
        if (!jobId) {
            return res.status(400).json({
                message: "Job id is required.",
                success: false
            })
        };
        // check if the user has already applied for the job
        const existingApplication = await Application.findOne({ job: jobId, applicant: userId });

        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied for this jobs",
                success: false
            });
        }

        // check if the jobs exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            })
        }
        // create a new application
        const newApplication = await Application.create({
            job:jobId,
            applicant:userId,
        });

        job.applications.push(newApplication._id);
        await job.save();
        return res.status(201).json({
            message:"Job applied successfully.",
            success:true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong while applying for the job.",
            success: false
        });
    }
};
export const getAppliedJobs = async (req,res) => {
    try {
        const userId = req.id;
        const application = await Application.find({applicant:userId}).sort({createdAt:-1}).populate({
            path:'job',
            options:{sort:{createdAt:-1}},
            populate:{
                path:'company',
                options:{sort:{createdAt:-1}},
            }
        });
        if(!application){
            return res.status(404).json({
                message:"No Applications",
                success:false
            })
        };
        return res.status(200).json({
            application,
            success:true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong while fetching applied jobs.",
            success: false
        });
    }
}
// admin dekhega kitna user ne apply kiya hai
export const getApplicants = async (req,res) => {
    try {
        const jobId = req.params.id;
        const recruiter = await User.findById(req.id).select("role");
        if (!recruiter || recruiter.role !== "recruiter") {
            return res.status(403).json({ message: "Recruiter access required.", success: false });
        }
        const job = await Job.findById(jobId).populate({
            path:'applications',
            options:{sort:{createdAt:-1}},
            populate:{
                path:'applicant'
            }
        });
        if(!job){
            return res.status(404).json({
                message:'Job not found.',
                success:false
            })
        };
        if (String(job.created_by) !== String(req.id)) {
            return res.status(403).json({ message: "You can only view applicants for your own jobs.", success: false });
        }
        return res.status(200).json({
            job,
            success:true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong while fetching applicants.",
            success: false
        });
    }
}
export const updateStatus = async (req,res) => {
    try {
        const {status} = req.body;
        if (!['accepted', 'rejected'].includes(String(status).toLowerCase())) {
            return res.status(400).json({ message: "Status must be accepted or rejected.", success: false });
        }
        const recruiter = await User.findById(req.id).select("role");
        if (!recruiter || recruiter.role !== "recruiter") {
            return res.status(403).json({ message: "Recruiter access required.", success: false });
        }
        const applicationId = req.params.id;
        if(!status){
            return res.status(400).json({
                message:'status is required',
                success:false
            })
        };

        // find the application by applicantion id
        const application = await Application.findOne({_id:applicationId}).populate("job");
        if(!application){
            return res.status(404).json({
                message:"Application not found.",
                success:false
            })
        };
        if (!application.job || String(application.job.created_by) !== String(req.id)) {
            return res.status(403).json({ message: "You can only update applications for your own jobs.", success: false });
        }

        // update the status
        application.status = status.toLowerCase();
        await application.save();

        return res.status(200).json({
            message:"Status updated successfully.",
            success:true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong while updating the status.",
            success: false
        });
    }
}
