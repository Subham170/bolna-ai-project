import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: [String],
      default: [],
    },
    ctc: {
      type: String,
      trim: true,
    },
    exp_req: {
      type: Number,
      min: 0,
    },
    job_type: {
      type: String,
      enum: ["Full time", "Internship"],
    },
    skills: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true, id: false }
);

export default mongoose.model("Job", jobSchema);
