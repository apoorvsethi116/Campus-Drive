import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // enforces one profile per user (1:1)
    },
    collegeId: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
      default: "",
    },
    branch: {
      type: String,
      required: [true, "Branch is required"],
      trim: true,
    },
    currentCGPA: {
      type: Number,
      required: [true, "Current CGPA is required"],
      min: [0, "CGPA cannot be negative"],
      max: [10, "CGPA cannot exceed 10"],
    },
    activeBacklogs: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Active backlogs cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Active backlogs must be a whole number",
      },
    },
    tenthPercentage: {
      type: Number,
      required: [true, "10th percentage is required"],
      min: [0, "Percentage cannot be negative"],
      max: [100, "Percentage cannot exceed 100"],
    },
    twelfthPercentage: {
      type: Number,
      required: [true, "12th percentage is required"],
      min: [0, "Percentage cannot be negative"],
      max: [100, "Percentage cannot exceed 100"],
    },
    graduationYear: {
      type: Number,
      required: [true, "Graduation year is required"],
      min: [2000, "Graduation year looks invalid"],
      max: [2100, "Graduation year looks invalid"],
    },
    resumeUrl: {
      type: String,
      trim: true,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Supports TPO filtering by branch + CGPA + backlogs, and eligibility scans.
studentProfileSchema.index({ branch: 1, currentCGPA: 1, activeBacklogs: 1 });

export const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);
