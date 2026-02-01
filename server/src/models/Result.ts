import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    champion: {
      department: { type: String, required: true },
    },
    runnerUp: {
      department: { type: String, required: true },
    },
    thirdPlace: {
      department: { type: String },
    },
    year: {
      type: Number,
      default: 2026,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Result", resultSchema);
