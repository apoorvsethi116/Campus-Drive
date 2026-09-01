import { body } from "express-validator";

const ALLOWED_ROLES = ["STUDENT", "TPO", "RECRUITER"];
const CURRENT_YEAR = new Date().getFullYear();

export const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("email").trim().isEmail().withMessage("Please provide a valid email address").normalizeEmail(),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(ALLOWED_ROLES)
    .withMessage(`Role must be one of: ${ALLOWED_ROLES.join(", ")}`),

  // The following fields are only required when role === STUDENT.
  // express-validator's `.if()` lets us make a field conditionally required
  // without writing a separate validator chain for each role.
  body("studentDetails.branch")
    .if(body("role").equals("STUDENT"))
    .trim()
    .notEmpty()
    .withMessage("Branch is required for student registration"),

  body("studentDetails.currentCGPA")
    .if(body("role").equals("STUDENT"))
    .isFloat({ min: 0, max: 10 })
    .withMessage("Current CGPA must be a number between 0 and 10"),

  body("studentDetails.activeBacklogs")
    .if(body("role").equals("STUDENT"))
    .optional()
    .isInt({ min: 0 })
    .withMessage("Active backlogs must be a non-negative whole number"),

  body("studentDetails.tenthPercentage")
    .if(body("role").equals("STUDENT"))
    .isFloat({ min: 0, max: 100 })
    .withMessage("10th percentage must be a number between 0 and 100"),

  body("studentDetails.twelfthPercentage")
    .if(body("role").equals("STUDENT"))
    .isFloat({ min: 0, max: 100 })
    .withMessage("12th percentage must be a number between 0 and 100"),

  body("studentDetails.graduationYear")
    .if(body("role").equals("STUDENT"))
    .isInt({ min: 2000, max: CURRENT_YEAR + 10 })
    .withMessage("Graduation year looks invalid"),
];

export const loginValidator = [
  body("email").trim().isEmail().withMessage("Please provide a valid email address").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];
