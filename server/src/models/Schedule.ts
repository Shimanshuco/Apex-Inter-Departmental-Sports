import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    sno: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    activity: {
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
    gender: {
      type: String,
      enum: ["Male", "Female", "Male and Female Both", ""],
      default: "",
    },
    matchDetail: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const Schedule = mongoose.model("Schedule", scheduleSchema);
