import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
  {
    sport: {
      type: String,
      required: true,
      enum: [
        "Football",
        "Volleyball",
        "Basketball",
        "Kabaddi",
        "Badminton - Singles",
        "Badminton - Doubles",
        "Chess",
        "Kho Kho",
        "Table Tennis - Singles",
        "Table Tennis - Doubles",
        "Tug of War",
        "Cricket",
        "Athletics - 100m",
        "Athletics - 200m",
      ],
    },
    category: {
      type: String,
      required: true,
      enum: ["Boys", "Girls"],
    },
    winner: {
      department: {
        type: String,
        required: true,
      },
      playerName: String, // For individual sports like Chess, Badminton Singles
    },
    runnerUp: {
      department: {
        type: String,
        required: true,
      },
      playerName: String,
    },
    secondRunnerUp: {
      department: String,
      playerName: String,
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

// Compound index to ensure unique sport + category + year combination
scoreSchema.index({ sport: 1, category: 1, year: 1 }, { unique: true });

export const Score = mongoose.model("Score", scoreSchema);
