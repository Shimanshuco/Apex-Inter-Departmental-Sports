import mongoose from "mongoose";

const ruleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    sport: {
      type: String,
      required: true,
      enum: [
        "General",
        "Football",
        "Volleyball",
        "Basketball",
        "Kabaddi",
        "Badminton",
        "Chess",
        "Kho Kho",
        "Table Tennis",
        "Tug of War",
        "Cricket",
        "Athletics",
      ],
      default: "General",
    },
    category: {
      type: String,
      enum: ["General Rules", "Game Rules", "Eligibility", "Conduct", "Scoring", "Equipment", "Other"],
      default: "General Rules",
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Rule = mongoose.model("Rule", ruleSchema);
