import Candidate from "../models/Candidate.js";
import CallRecord from "../models/CallRecord.js";
import Job from "../models/Job.js";
import { scoreTranscriptWithGemini } from "../services/geminiService.js";
import { calculateWeightedScore } from "../utils/scoring.js";
import { fetchBolnaExecution, scheduleBolnaCall } from "../services/bolnaService.js";

const scoreCandidateWithTranscript = async ({ candidate, transcript, jobId = null }) => {
  const targetJobId = jobId || candidate.job;
  const job = await Job.findById(targetJobId);
  if (!job) {
    throw new Error("Associated job not found");
  }

  const aiResult = await scoreTranscriptWithGemini({
    transcript,
    jobDescription: job.description,
    jobTitle: job.title,
  });

  const weightedScore = calculateWeightedScore(aiResult.scoreBreakdown);

  const callRecord = await CallRecord.findOneAndUpdate(
    { candidate: candidate._id },
    {
      candidate: candidate._id,
      job: job._id,
      transcript,
      extractedAnswers: aiResult.extractedAnswers || {},
      scoreBreakdown: aiResult.scoreBreakdown || {},
      weightedScore,
      recommendation: aiResult.recommendation || "PENDING",
      reasoning: aiResult.reasoning || "",
      redFlags: aiResult.redFlags || [],
      rawModelOutput: aiResult.rawModelOutput || "",
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  // Once transcript is scored, candidate moves to screening score round.
  candidate.status = "SCREENING_SCORE";

  await candidate.save();

  return { callRecord, aiResult };
};

const initiateBolnaCall = async (req, res) => {
  try {
    const { candidateId, jobId, scheduled_at, user_data } = req.body;

    if (!candidateId) {
      return res.status(400).json({ message: "candidateId is required" });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    if (!candidate.phone_no) {
      return res.status(400).json({ message: "Candidate phone_no is missing" });
    }

    const targetJob = jobId ? await Job.findById(jobId) : await Job.findById(candidate.job);
    if (!targetJob) {
      return res.status(404).json({ message: "Job not found for call context" });
    }

    const scheduledAt = scheduled_at || new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const bolnaResult = await scheduleBolnaCall({
      recipientPhoneNumber: candidate.phone_no,
      scheduledAt,
      userData: {
        candidate_name: candidate.name,
        candidate_email: candidate.email,
        job_title: targetJob.title || "",
        job_description: targetJob.description || "",
        ...(user_data || {}),
      },
    });

    const callRecord = await CallRecord.findOneAndUpdate(
      { candidate: candidate._id },
      {
        candidate: candidate._id,
        job: targetJob._id,
        bolna: {
          executionId: bolnaResult.executionId,
          callId: bolnaResult.raw.call_id || bolnaResult.raw.id || "",
          status: bolnaResult.status,
          response: bolnaResult.raw,
          scheduledAt: new Date(scheduledAt),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    candidate.status = "CALLED";
    await candidate.save();

    return res.status(200).json({
      message: "Call scheduled with Bolna",
      executionId: bolnaResult.executionId,
      candidateId: candidate._id,
      callRecord,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const upsertCallTranscriptAndScore = async (req, res) => {
  try {
    const { candidateId, jobId, transcript } = req.body;

    if (!candidateId || !transcript) {
      return res.status(400).json({ message: "candidateId and transcript are required" });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const { callRecord } = await scoreCandidateWithTranscript({ candidate, transcript, jobId });

    return res.json({
      candidateId: candidate._id,
      status: candidate.status,
      callRecord,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getCandidateCallResult = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const record = await CallRecord.findOne({ candidate: candidateId }).populate({
      path: "candidate",
      populate: { path: "job", select: "title" },
    }).populate("job", "title description skills");

    if (!record) {
      return res.status(404).json({ message: "Call record not found" });
    }

    return res.json(record);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const syncBolnaExecution = async (req, res) => {
  try {
    const { executionId } = req.params;
    if (!executionId) {
      return res.status(400).json({ message: "executionId is required" });
    }

    const execution = await fetchBolnaExecution(executionId);
    const transcript = execution?.transcript || "";

    const callRecord = await CallRecord.findOne({ "bolna.executionId": executionId });
    if (!callRecord) {
      return res.status(404).json({ message: "Call record not found for executionId" });
    }

    callRecord.bolna = {
      executionId,
      callId: execution.call_id || execution.id || callRecord.bolna?.callId || "",
      status: execution.status || callRecord.bolna?.status || "PENDING",
      response: execution,
      scheduledAt: callRecord.bolna?.scheduledAt || null,
    };

    if (transcript.trim()) {
      callRecord.transcript = transcript;
    }

    await callRecord.save();

    const transcriptForScoring =
      typeof transcript === "string" && transcript.trim() ? transcript.trim() : callRecord.transcript || "";
    const disconnectedStatuses = ["completed", "disconnected", "ended", "done", "finished"];
    const shouldScore =
      transcriptForScoring.length > 0 &&
      disconnectedStatuses.includes(String(callRecord.bolna?.status || "").toLowerCase());

    if (shouldScore) {
      const candidate = await Candidate.findById(callRecord.candidate);
      if (candidate) {
        await scoreCandidateWithTranscript({
          candidate,
          transcript: transcriptForScoring,
          jobId: callRecord.job || candidate.job || null,
        });
      }
    }

    return res.json({
      message: "Bolna execution synced",
      executionId,
      hasTranscript: Boolean(transcript.trim()),
      status: callRecord.bolna.status,
      scored: shouldScore,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const bolnaWebhook = async (req, res) => {
  try {
    const payload = req.body || {};
    const executionId =
      payload.execution_id ||
      payload.executionId ||
      payload.id ||
      payload.call_id ||
      payload.execution?.execution_id ||
      payload.execution?.executionId ||
      payload.execution?.id ||
      "";

    if (!executionId) {
      return res.status(400).json({ message: "executionId not found in webhook payload" });
    }

    const transcript = payload.transcript || payload.execution?.transcript || "";
    const callStatus =
      payload.status || payload.state || payload.event || payload.execution?.status || "PENDING";

    const callRecord = await CallRecord.findOne({ "bolna.executionId": executionId }).populate(
      "candidate"
    );
    if (!callRecord) {
      return res.status(404).json({ message: "Call record not found for executionId" });
    }

    callRecord.bolna = {
      executionId,
      callId: payload.call_id || payload.id || callRecord.bolna?.callId || "",
      status: callStatus,
      response: payload,
      scheduledAt: callRecord.bolna?.scheduledAt || null,
    };

    if (typeof transcript === "string" && transcript.trim()) {
      callRecord.transcript = transcript;
    }

    await callRecord.save();

    const transcriptForScoring =
      typeof transcript === "string" && transcript.trim() ? transcript.trim() : callRecord.transcript || "";
    const disconnectedStatuses = ["completed", "disconnected", "ended", "done", "finished"];
    const shouldScore =
      transcriptForScoring.length > 0 &&
      disconnectedStatuses.includes(String(callStatus).toLowerCase());

    if (shouldScore && callRecord.candidate) {
      await scoreCandidateWithTranscript({
        candidate: callRecord.candidate,
        transcript: transcriptForScoring,
        jobId: callRecord.job || callRecord.candidate.job || null,
      });
    }

    return res.status(200).json({
      message: "Webhook received",
      executionId,
      stored: true,
      scored: shouldScore,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export {
  initiateBolnaCall,
  upsertCallTranscriptAndScore,
  getCandidateCallResult,
  syncBolnaExecution,
  bolnaWebhook,
};
