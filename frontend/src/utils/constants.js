export const ROLES = {
  STUDENT: "STUDENT",
  TPO: "TPO",
  RECRUITER: "RECRUITER",
};

/**
 * Where each role lands after login, and where ProtectedRoute sends a
 * logged-in user who tries to visit a route that isn't theirs.
 */
export const DASHBOARD_PATH_BY_ROLE = {
  [ROLES.STUDENT]: "/student/dashboard",
  [ROLES.TPO]: "/tpo/dashboard",
  [ROLES.RECRUITER]: "/recruiter/dashboard",
};

/**
 * Kept here rather than hardcoded in the registration form, so the same
 * list can be reused anywhere else branches need to be selected from
 * (e.g., a TPO's drive-creation form in a later phase).
 */
export const BRANCHES = [
  "Computer Science",
  "Information Technology",
  "Electronics and Communication",
  "Electronics",
  "Mechanical Engineering",
  "Civil Engineering",
];

/** Mirrors backend PlacementDrive.model.js's EMPLOYMENT_TYPES_LIST exactly. */
export const EMPLOYMENT_TYPES = [
  { value: "FULL_TIME", label: "Full-Time" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "INTERNSHIP_PLUS_PPO", label: "Internship + PPO" },
];

/** Mirrors backend PlacementDrive.model.js's DRIVE_STATUSES_LIST exactly. */
export const DRIVE_STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "OPEN", label: "Open" },
  { value: "CLOSED", label: "Closed" },
  { value: "COMPLETED", label: "Completed" },
];

export const APPLICATION_STATUSES = [
  "APPLIED",
  "SHORTLISTED",
  "OA_CLEARED",
  "INTERVIEW",
  "OFFERED",
  "REJECTED",
];

/**
 * UI hint only: statuses from which the backend's ALLOWED_TRANSITIONS
 * map (application.service.js) allows a move to WITHDRAWN. Used only
 * to decide whether to show a "Withdraw" button - the backend
 * independently re-checks this on every withdraw request and remains
 * the only real authority (see withdrawApplication in
 * application.service.js).
 */
export const WITHDRAWABLE_STATUSES = ["APPLIED", "SHORTLISTED", "OA_CLEARED", "INTERVIEW"];

/**
 * UI hint only, mirroring backend's ALLOWED_TRANSITIONS in
 * application.service.js exactly - used to disable invalid options in
 * the recruiter's status dropdown so they don't submit an obviously
 * illegal transition. This does NOT replace backend enforcement: the
 * server independently re-validates every transition (Phase 5) and
 * remains the only real authority. WITHDRAWN is intentionally excluded
 * here since recruiters are not allowed to set it (student-only action).
 */
export const RECRUITER_ALLOWED_TRANSITIONS = {
  APPLIED: ["SHORTLISTED", "REJECTED"],
  SHORTLISTED: ["OA_CLEARED", "REJECTED"],
  OA_CLEARED: ["INTERVIEW", "REJECTED"],
  INTERVIEW: ["OFFERED", "REJECTED"],
  OFFERED: [],
  REJECTED: [],
  WITHDRAWN: [],
};
