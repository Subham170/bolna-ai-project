import express from "express";
import {
  bolnaWebhook,
  initiateBolnaCall,
  syncBolnaExecution,
  upsertCallTranscriptAndScore,
  getCandidateCallResult,
} from "../controllers/callController.js";

const router = express.Router();

router.post("/webhook/bolna", bolnaWebhook);
router.post("/initiate", initiateBolnaCall);
router.post("/sync/:executionId", syncBolnaExecution);
router.post("/transcript", upsertCallTranscriptAndScore);
router.get("/candidate/:candidateId", getCandidateCallResult);

export default router;
