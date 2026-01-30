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
  "Kho Kho",
  "Tug of War",
  "Athletics",
  "Swimming",
  "Chess",
  "Carrom",
  "Handball",
  "Throwball",
];

const GENDERS = ["Male", "Female", "Other"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "PG 1st Year", "PG 2nd Year", "PhD"];

const departmentPlayerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    rNumber: {
      type: String,
      required: true,
    },
    uniqueId: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: GENDERS,
      required: true,
    },
    year: {
      type: String,
      enum: YEARS,
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
    status: {
      type: String,
      enum: ["active", "inactive", "pending", "approved", "rejected"],
      default: "pending",
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index to ensure a player can only be in 2 sports max within the same department
departmentPlayerSchema.index({ rNumber: 1, department: 1, sport: 1 }, { unique: true });

export const DepartmentPlayer = mongoose.model("DepartmentPlayer", departmentPlayerSchema);
export { SPORTS_LIST };
