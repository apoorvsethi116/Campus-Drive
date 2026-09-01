import mongoose from "mongoose";

const APPLICATION_STATUSES = [
  "APPLIED",
  "SHORTLISTED",
  "OA_CLEARED",
  "INTERVIEW",
  "OFFERED",
  "REJECTED",
  "WITHDRAWN",
];

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
    },
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlacementDrive",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: APPLICATION_STATUSES,
        message: "Invalid application status",
      },
      default: "APPLIED",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    recruiterNotes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// The actual duplicate-application guard: MongoDB rejects a second
// (student, drive) pair at the database level, not just in app code.
applicationSchema.index({ student: 1, drive: 1 }, { unique: true });

// Supports recruiter candidate views filtered by status per drive.
applicationSchema.index({ drive: 1, status: 1 });

export const APPLICATION_STATUSES_LIST = APPLICATION_STATUSES;
export const Application = mongoose.model("Application", applicationSchema);
