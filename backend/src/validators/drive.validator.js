import { body } from "express-validator";

const EMPLOYMENT_TYPES = ["FULL_TIME", "INTERNSHIP", "INTERNSHIP_PLUS_PPO"];
const DRIVE_STATUSES = ["DRAFT", "OPEN", "CLOSED", "COMPLETED"];

export const createDriveValidator = [
  body("companyName").trim().notEmpty().withMessage("Company name is required"),
  body("jobRole").trim().notEmpty().withMessage("Job role is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),

  body("employmentType")
    .notEmpty()
    .withMessage("Employment type is required")
    .isIn(EMPLOYMENT_TYPES)
    .withMessage(`Employment type must be one of: ${EMPLOYMENT_TYPES.join(", ")}`),

  body("ctc").isFloat({ min: 0 }).withMessage("CTC must be a non-negative number"),

  body("eligibilityCriteria.minCGPA")
    .isFloat({ min: 0, max: 10 })
    .withMessage("minCGPA must be a number between 0 and 10"),

  body("eligibilityCriteria.maxBacklogs")
    .isInt({ min: 0 })
    .withMessage("maxBacklogs must be a non-negative whole number"),

  body("eligibilityCriteria.allowedBranches")
    .isArray({ min: 1 })
    .withMessage("At least one allowed branch is required"),

  body("eligibilityCriteria.allowedBranches.*")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Each allowed branch must be a non-empty string"),

  body("eligibilityCriteria.minTenthPercentage")
    .isFloat({ min: 0, max: 100 })
    .withMessage("minTenthPercentage must be a number between 0 and 100"),

  body("eligibilityCriteria.minTwelfthPercentage")
    .isFloat({ min: 0, max: 100 })
    .withMessage("minTwelfthPercentage must be a number between 0 and 100"),

  body("deadline").isISO8601().withMessage("Deadline must be a valid date"),
  body("driveDate").isISO8601().withMessage("Drive date must be a valid date"),

  body("recruiters")
    .optional()
    .isArray()
    .withMessage("Recruiters must be a list of user IDs"),

  body("recruiters.*").optional().isMongoId().withMessage("Each recruiter ID must be a valid ID"),

  body("status")
    .optional()
    .isIn(DRIVE_STATUSES)
    .withMessage(`Status must be one of: ${DRIVE_STATUSES.join(", ")}`),
];

/**
 * Update validator: every field optional (PATCH semantics), but each one
 * still validated with the same rules as creation when it IS provided.
 * Deliberately not just createDriveValidator.map(rule => rule.optional())
 * because nested subfields like eligibilityCriteria.minCGPA need their
 * own explicit .optional() to be individually skippable.
 */
export const updateDriveValidator = [
  body("companyName").optional().trim().notEmpty().withMessage("Company name cannot be empty"),
  body("jobRole").optional().trim().notEmpty().withMessage("Job role cannot be empty"),
  body("description").optional().trim().notEmpty().withMessage("Description cannot be empty"),
  body("location").optional().trim().notEmpty().withMessage("Location cannot be empty"),

  body("employmentType")
    .optional()
    .isIn(EMPLOYMENT_TYPES)
    .withMessage(`Employment type must be one of: ${EMPLOYMENT_TYPES.join(", ")}`),

  body("ctc").optional().isFloat({ min: 0 }).withMessage("CTC must be a non-negative number"),

  body("eligibilityCriteria.minCGPA")
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage("minCGPA must be a number between 0 and 10"),

  body("eligibilityCriteria.maxBacklogs")
    .optional()
    .isInt({ min: 0 })
    .withMessage("maxBacklogs must be a non-negative whole number"),

  body("eligibilityCriteria.allowedBranches")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one allowed branch is required"),

  body("eligibilityCriteria.allowedBranches.*")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Each allowed branch must be a non-empty string"),

  body("eligibilityCriteria.minTenthPercentage")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("minTenthPercentage must be a number between 0 and 100"),

  body("eligibilityCriteria.minTwelfthPercentage")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("minTwelfthPercentage must be a number between 0 and 100"),

  body("deadline").optional().isISO8601().withMessage("Deadline must be a valid date"),
  body("driveDate").optional().isISO8601().withMessage("Drive date must be a valid date"),

  body("recruiters")
    .optional()
    .isArray()
    .withMessage("Recruiters must be a list of user IDs"),

  body("recruiters.*").optional().isMongoId().withMessage("Each recruiter ID must be a valid ID"),

  body("status")
    .optional()
    .isIn(DRIVE_STATUSES)
    .withMessage(`Status must be one of: ${DRIVE_STATUSES.join(", ")}`),
];
