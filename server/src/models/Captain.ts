import mongoose from "mongoose";

const DEPARTMENTS = [
  "Engineering",
  "Commerce & Management",
  "Computer & IT",
  "Law",
  "Basic Life & Applied Sciences",
  "Humanities and Arts",
  "Journalism & Mass Communication",
  "Physiotherapy",
  "Naturopathy & Yogic Sciences",
  "Fashion & Design",
  "Pharmaceutical Sciences",
  "Special Education",
  "Clinical Psychology",
  "Agriculture",
  "Library Science",
  "Nursing",
  "Education",
  "Paramedical",
  "Veterinary Science",
  "Research",
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Other"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "PG 1st Year", "PG 2nd Year", "PhD"];

const captainSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    rNumber: {
      type: String,
      required: true,
      unique: true,
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
    department: {
      type: String,
      enum: DEPARTMENTS,
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
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
    status: {
      type: String,
      enum: ["active", "inactive", "pending", "approved", "rejected"],
      default: "pending",
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Captain = mongoose.model("Captain", captainSchema);
export { DEPARTMENTS, BLOOD_GROUPS, GENDERS, YEARS };
