import Job from "../models/Job.js";
import Candidate from "../models/Candidate.js";
import CallRecord from "../models/CallRecord.js";

const createJob = async (req, res) => {
  try {
    const {
      id,
      title,
      description,
      company,
      role,
      ctc,
      exp_req,
      job_type,
      skills,
    } = req.body;

    if (!id || !title || !description || !company) {
      return res
        .status(400)
        .json({ message: "id, title, description and company are required" });
    }

    const job = await Job.create({
      id,
      title,
      description,
      company,
      role: role || [],
      ctc,
      exp_req,
      job_type,
      skills: skills || [],
    });

    return res.status(201).json(job);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const listJobs = async (_req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    return res.json(jobs);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getJobMatchedCandidates = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const candidates = await Candidate.find({ is_active: true }).sort({ createdAt: -1 }).lean();
    const candidateIds = candidates.map((candidate) => candidate._id);
    const callRecords = await CallRecord.find({ candidate: { $in: candidateIds } })
      .select("candidate transcript weightedScore recommendation reasoning")
      .lean();

    const callMap = new Map(callRecords.map((record) => [String(record.candidate), record]));
    const jobSkills = (job.skills || []).map((skill) => String(skill).trim().toLowerCase());

    const matches = candidates
      .map((candidate) => {
        const candidateSkills = (candidate.skills || []).map((skill) =>
          String(skill).trim().toLowerCase()
        );
        const matchedSkills = candidateSkills.filter((skill) => jobSkills.includes(skill));
        const matchPercent =
          jobSkills.length > 0 ? Number(((matchedSkills.length / jobSkills.length) * 100).toFixed(2)) : 0;
        const callRecord = callMap.get(String(candidate._id)) || null;

        return {
          candidate,
          matchPercent,
          matchedSkills,
          callRecord,
        };
      })
      .sort((a, b) => b.matchPercent - a.matchPercent);

    return res.json({
      job,
      totalCandidates: matches.length,
      matches,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export { createJob, listJobs, getJobMatchedCandidates };
