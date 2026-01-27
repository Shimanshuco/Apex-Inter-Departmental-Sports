import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    teamA: {
      type: String,
      required: true,
    },
    teamB: {
      type: String,
      required: true,
    },
    sport: {
      type: String,
      required: true,
      enum: [
        "Football",
        "Volleyball",
        "Basketball",
        "Kabaddi",
        "Badminton",
        "Chess",
        "Kho Kho",
        "Table Tennis",
        "Tug of War",
        "Sack Race",
      ],
    },
    venue: String,
    scoreA: {
      type: Number,
      default: 0,
    },
    scoreB: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["scheduled", "live", "completed"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

export const Match = mongoose.model("Match", matchSchema);
