import { body } from "express-validator";

const APPLICATION_STATUSES = [
  "APPLIED",
  "SHORTLISTED",
  "OA_CLEARED",
  "INTERVIEW",
  "OFFERED",
  "REJECTED",
  "WITHDRAWN",
];

/**
 * Both fields are optional at the field-validation level because a
 * recruiter might update just the notes without changing status, or
 * just the status without adding a note. The service layer requires at
 * least one of them to have an effect — validators check shape, not
 * business rules like "at least one field must be present", which
 * belongs in the service (see application.service.js).
 */
export const updateApplicationStatusValidator = [
  body("status")
    .optional()
    .isIn(APPLICATION_STATUSES)
    .withMessage(`Status must be one of: ${APPLICATION_STATUSES.join(", ")}`),

  body("recruiterNotes").optional().trim().isLength({ max: 2000 }).withMessage("Notes must be under 2000 characters"),
];
