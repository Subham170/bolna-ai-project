import Candidate from "../models/Candidate.js";

const createCandidate = async (req, res) => {
  try {
    const {
      name,
      email,
      phone_no,
      image,
      skills,
      experience,
      resume_url,
      role,
      bio,
      is_active,
      social_links,
      job,
    } = req.body;

    if (!name || !email || !phone_no) {
      return res.status(400).json({ message: "name, email and phone_no are required" });
    }

    const candidate = await Candidate.create({
      name,
      email,
      phone_no,
      image,
      skills: skills || [],
      experience,
      resume_url,
      role: role || [],
      bio,
      is_active,
      social_links,
      job,
    });

    return res.status(201).json(candidate);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const listCandidates = async (req, res) => {
  try {
    const { jobId, status } = req.query;
    const filter = {};

    if (jobId) filter.job = jobId;
    if (status) filter.status = status;

    const candidates = await Candidate.find(filter)
      .populate("job", "title")
      .sort({ createdAt: -1 });

    return res.json(candidates);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export { createCandidate, listCandidates };
