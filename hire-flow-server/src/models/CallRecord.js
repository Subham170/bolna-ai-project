import mongoose from "mongoose";

const scoreBreakdownSchema = new mongoose.Schema(
  {
    skillMatch: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    salaryFit: { type: Number, default: 0 },
    availabilityFit: { type: Number, default: 0 },
  },
  { _id: false }
);

const callRecordSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      unique: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      default: null,
    },
    transcript: {
      type: String,
      default: "",
    },
    bolna: {
      executionId: { type: String, default: "" },
      callId: { type: String, default: "" },
      status: { type: String, default: "PENDING" },
      response: { type: mongoose.Schema.Types.Mixed, default: null },
      scheduledAt: { type: Date, default: null },
    },
    extractedAnswers: {
      availability: { type: String, default: "" },
      expectedSalary: { type: String, default: "" },
      skills: { type: [String], default: [] },
      noticePeriod: { type: String, default: "" },
      locationPreference: { type: String, default: "" },
    },
    scoreBreakdown: {
      type: scoreBreakdownSchema,
      default: () => ({}),
    },
    weightedScore: {
      type: Number,
      default: 0,
    },
    recommendation: {
      type: String,
      enum: ["STRONG_YES", "MAYBE", "NO", "PENDING"],
      default: "PENDING",
    },
    reasoning: {
      type: String,
      default: "",
    },
    redFlags: {
      type: [String],
      default: [],
    },
    rawModelOutput: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("CallRecord", callRecordSchema);
