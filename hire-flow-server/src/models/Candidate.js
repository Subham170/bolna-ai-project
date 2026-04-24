import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone_no: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: Number,
      min: 0,
    },
    resume_url: {
      type: String,
      trim: true,
    },
    role: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      trim: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    social_links: {
      linkedin: { type: String, trim: true },
      github: { type: String, trim: true },
      portfolio: { type: String, trim: true },
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    status: {
      type: String,
      enum: [
        "PENDING_CALL",
        "CALLED",
        "SCREENING_SCORE",
        "SCORED",
        "QUALIFIED",
        "REJECTED",
      ],
      default: "PENDING_CALL",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Candidate", candidateSchema);
