import mongoose from "mongoose";

const ROLES = ["STUDENT", "TPO", "RECRUITER"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must be under 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // never returned by default on find queries
    },
    role: {
      type: String,
      enum: {
        values: ROLES,
        message: "Role must be one of STUDENT, TPO, RECRUITER",
      },
      required: [true, "Role is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// email already has a unique index via `unique: true` above — no duplicate index added here.

export const ROLES_LIST = ROLES;
export const User = mongoose.model("User", userSchema);
