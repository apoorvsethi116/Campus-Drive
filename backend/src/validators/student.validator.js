import { body } from "express-validator";

/**
 * All fields optional here — this validates a PATCH (partial update),
 * not a full replacement. Only fields the student actually sends are
 * checked; anything omitted is left untouched by the controller.
 */
export const updateProfileValidator = [
  body("branch").optional().trim().notEmpty().withMessage("Branch cannot be empty"),

  body("currentCGPA")
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage("Current CGPA must be a number between 0 and 10"),

  body("activeBacklogs")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Active backlogs must be a non-negative whole number"),

  body("tenthPercentage")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("10th percentage must be a number between 0 and 100"),

  body("twelfthPercentage")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("12th percentage must be a number between 0 and 100"),

  body("phone")
    .optional()
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be exactly 10 digits"),

  body("resumeUrl").optional().trim().isURL().withMessage("Resume URL must be a valid URL"),

  body("skills").optional().isArray().withMessage("Skills must be a list of strings"),

  body("skills.*").optional().isString().trim().notEmpty().withMessage("Each skill must be a non-empty string"),

  body("collegeId").optional().trim(),
];
