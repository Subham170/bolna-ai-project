import express from "express";
import { createCandidate, listCandidates } from "../controllers/candidateController.js";

const router = express.Router();

router.post("/", createCandidate);
router.get("/", listCandidates);

export default router;
