import mongoose from "mongoose";

const SPORTS_LIST = [
  "Football",
  "Cricket",
  "Basketball",
  "Volleyball",
  "Badminton",
  "Table Tennis",
  "Tennis",
  "Hockey",
  "Kabaddi",
  "Kho-Kho",
  "Athletics",
  "Swimming",
  "Chess",
  "Carrom",
  "Handball",
  "Throwball",
];

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sport: {
      type: String,
      enum: SPORTS_LIST,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Captain",
      required: true,
    },
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DepartmentPlayer",
      },
    ],
    maxPlayers: {
      type: Number,
      default: 15,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index to ensure one team per sport per department
teamSchema.index({ sport: 1, department: 1 }, { unique: true });

export const Team = mongoose.model("Team", teamSchema);
