/**
 * Eligibility Engine
 *
 * WHAT: A single pure function that compares a student's profile against
 *       a drive's eligibility criteria and returns a structured result.
 * WHY: Eligibility needs to be checked in at least four different places
 *      (student drive listing, drive details, application submission,
 *      and later TPO's eligible-students report). Putting the logic here
 *      once means all four places agree, always, with zero duplication.
 * WHERE: Called by student controllers (Phase 3) and, later, TPO
 *        controllers (Phase 4). Never called directly by routes.
 *
 * Deliberately pure: no DB calls, no req/res, just data in -> data out.
 * That makes it trivial to reason about and to unit test in isolation.
 */

/**
 * @param {Object} studentProfile - a StudentProfile document (or plain object)
 *   with branch, currentCGPA, activeBacklogs, tenthPercentage, twelfthPercentage
 * @param {Object} eligibilityCriteria - a drive's eligibilityCriteria subdocument
 *   with minCGPA, maxBacklogs, allowedBranches, minTenthPercentage, minTwelfthPercentage
 * @returns {{ eligible: boolean, reasons: string[] }}
 */
/**
 * @param {Object} studentProfile - a StudentProfile document (or plain object)
 *   with branch, currentCGPA, activeBacklogs, tenthPercentage, twelfthPercentage
 * @param {Object} eligibilityCriteria - a drive's eligibilityCriteria subdocument
 *   with minCGPA, maxBacklogs, allowedBranches, minTenthPercentage, minTwelfthPercentage
 * @returns {{ eligible: boolean, reasons: string[], checks: Array }}
 *
 * `checks` is a per-criterion breakdown (one entry per rule, whether it
 * passed or failed) added for the "explainable eligibility" feature -
 * frontend can show a full checklist (✓ CGPA meets requirement, ✓
 * backlogs within limit, ✗ branch not allowed, ...) instead of only a
 * list of failures. `eligible` and `reasons` are unchanged in shape and
 * wording from before; `reasons` is now simply derived from the failing
 * entries in `checks`, so there is exactly one place per criterion that
 * decides pass/fail - not two.
 */
export function checkEligibility(studentProfile, eligibilityCriteria) {
  const cgpaPassed = studentProfile.currentCGPA >= eligibilityCriteria.minCGPA;
  const backlogsPassed = studentProfile.activeBacklogs <= eligibilityCriteria.maxBacklogs;
  const branchPassed = eligibilityCriteria.allowedBranches.includes(studentProfile.branch);
  const tenthPassed = studentProfile.tenthPercentage >= eligibilityCriteria.minTenthPercentage;
  const twelfthPassed = studentProfile.twelfthPercentage >= eligibilityCriteria.minTwelfthPercentage;

  const checks = [
    {
      key: "minCGPA",
      label: "CGPA",
      passed: cgpaPassed,
      message: cgpaPassed
        ? `CGPA (${studentProfile.currentCGPA}) meets the required minimum of ${eligibilityCriteria.minCGPA}`
        : `Current CGPA (${studentProfile.currentCGPA}) is below the required minimum of ${eligibilityCriteria.minCGPA}`,
    },
    {
      key: "maxBacklogs",
      label: "Backlogs",
      passed: backlogsPassed,
      message: backlogsPassed
        ? `Active backlogs (${studentProfile.activeBacklogs}) are within the allowed limit of ${eligibilityCriteria.maxBacklogs}`
        : `Active backlogs (${studentProfile.activeBacklogs}) exceed the maximum allowed (${eligibilityCriteria.maxBacklogs})`,
    },
    {
      key: "branch",
      label: "Branch",
      passed: branchPassed,
      message: branchPassed
        ? `${studentProfile.branch} is an eligible branch for this drive`
        : `${studentProfile.branch} is not an eligible branch for this drive`,
    },
    {
      key: "minTenthPercentage",
      label: "10th percentage",
      passed: tenthPassed,
      message: tenthPassed
        ? `10th percentage (${studentProfile.tenthPercentage}%) meets the required minimum of ${eligibilityCriteria.minTenthPercentage}%`
        : `10th percentage (${studentProfile.tenthPercentage}%) is below the required minimum of ${eligibilityCriteria.minTenthPercentage}%`,
    },
    {
      key: "minTwelfthPercentage",
      label: "12th percentage",
      passed: twelfthPassed,
      message: twelfthPassed
        ? `12th percentage (${studentProfile.twelfthPercentage}%) meets the required minimum of ${eligibilityCriteria.minTwelfthPercentage}%`
        : `12th percentage (${studentProfile.twelfthPercentage}%) is below the required minimum of ${eligibilityCriteria.minTwelfthPercentage}%`,
    },
  ];

  const reasons = checks.filter((check) => !check.passed).map((check) => check.message);

  return {
    eligible: reasons.length === 0,
    reasons,
    checks,
  };
}
