import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { archiveJob, getAdminJobs, getAllJobs, getJobById, postJob, restoreJob, updateJob } from "../controllers/job.contraller.js";

const router=express.Router();
router.route("/post").post(isAuthenticated,postJob);
router.route("/:id/restore").put(isAuthenticated,restoreJob);
router.route("/:id").put(isAuthenticated,updateJob);
router.route("/:id").delete(isAuthenticated,archiveJob);
// Browsing jobs is a public action (like any job board) — it should not
// require login. These were wrongly behind isAuthenticated, so anonymous
// visitors got a 401 and the homepage always showed "No Job Available".
router.route("/get").get(getAllJobs);
router.route("/getAdminJobs").get(isAuthenticated,getAdminJobs);
router.route("/get/:id").get(getJobById);

export default router;                     