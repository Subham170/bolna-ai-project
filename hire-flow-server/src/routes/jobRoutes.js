import express from "express";
import { createJob, getJobMatchedCandidates, listJobs } from "../controllers/jobController.js";

const router = express.Router();

router.post("/", createJob);
router.get("/", listJobs);
router.get("/:jobId/matches", getJobMatchedCandidates);

export default router;
