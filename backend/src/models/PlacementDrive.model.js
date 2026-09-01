import mongoose from "mongoose";

const DRIVE_STATUSES = ["DRAFT", "OPEN", "CLOSED", "COMPLETED"];
const EMPLOYMENT_TYPES = ["FULL_TIME", "INTERNSHIP", "INTERNSHIP_PLUS_PPO"];

const eligibilityCriteriaSchema = new mongoose.Schema(
  {
    minCGPA: {
      type: Number,
      required: true,
      min: [0, "minCGPA cannot be negative"],
      max: [10, "minCGPA cannot exceed 10"],
    },
    maxBacklogs: {
      type: Number,
      required: true,
      min: [0, "maxBacklogs cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "maxBacklogs must be a whole number",
      },
    },
    allowedBranches: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one allowed branch is required",
      },
    },
    minTenthPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    minTwelfthPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);

const placementDriveSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    jobRole: {
      type: String,
      required: [true, "Job role is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    employmentType: {
      type: String,
      enum: {
        values: EMPLOYMENT_TYPES,
        message: "Invalid employment type",
      },
      required: true,
    },
    ctc: {
      type: Number,
      required: [true, "CTC is required"],
      min: [0, "CTC cannot be negative"],
    },
    eligibilityCriteria: {
      type: eligibilityCriteriaSchema,
      required: true,
    },
    deadline: {
      type: Date,
      required: [true, "Application deadline is required"],
    },
    driveDate: {
      type: Date,
      required: [true, "Drive date is required"],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Recruiters explicitly assigned to this drive. Access control checks
    // membership in this array — recruiters cannot see drives they are not in.
    recruiters: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: DRIVE_STATUSES,
        message: "Invalid drive status",
      },
      default: "DRAFT",
    },
  },
  { timestamps: true }
);

// Supports "list open drives before deadline" queries used by students and TPO.
placementDriveSchema.index({ deadline: 1, status: 1 });
placementDriveSchema.index({ recruiters: 1 });

export const DRIVE_STATUSES_LIST = DRIVE_STATUSES;
export const EMPLOYMENT_TYPES_LIST = EMPLOYMENT_TYPES;
export const PlacementDrive = mongoose.model("PlacementDrive", placementDriveSchema);
