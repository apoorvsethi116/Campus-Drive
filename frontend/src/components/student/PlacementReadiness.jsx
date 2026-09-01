/**
 * Placement Readiness Summary (product differentiator).
 *
 * WHAT: "Eligible for X / Y active drives", plus the most common
 *       blockers across the ones you're not eligible for.
 * WHY it does NOT duplicate eligibility logic: every drive passed in
 *      here already carries a `drive.eligibility.eligible` boolean and
 *      a `drive.eligibility.checks` array computed by the backend's
 *      checkEligibility() (see eligibility.service.js). This component
 *      only COUNTS how often each already-decided check failed across
 *      a list of drives - it never re-evaluates CGPA, backlogs, branch,
 *      or percentages itself. If the backend's rules change, this
 *      summary changes with it automatically.
 * WHERE: Rendered on the student dashboard, computed from the same
 *        `drives` array the dashboard already fetches - no separate
 *        endpoint or analytics infrastructure.
 */
const BLOCKER_PHRASING = {
  minCGPA: "require a higher CGPA than you currently have",
  maxBacklogs: "allow fewer backlogs than you currently have",
  branch: "don't allow your branch",
  minTenthPercentage: "require a higher 10th percentage",
  minTwelfthPercentage: "require a higher 12th percentage",
};

function summarizeBlockers(activeDrives) {
  const counts = {};

  for (const drive of activeDrives) {
    if (drive.eligibility.eligible) continue;
    for (const check of drive.eligibility.checks) {
      if (!check.passed) {
        counts[check.key] = (counts[check.key] || 0) + 1;
      }
    }
  }

  return Object.entries(counts)
    .filter(([key]) => BLOCKER_PHRASING[key])
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({ count, phrase: BLOCKER_PHRASING[key] }));
}

export function PlacementReadiness({ drives }) {
  const activeDrives = drives.filter((d) => d.status === "OPEN");
  const eligibleCount = activeDrives.filter((d) => d.eligibility.eligible).length;
  const blockers = summarizeBlockers(activeDrives);

  if (activeDrives.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-500">No active drives right now to evaluate your readiness against.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <p className="font-display text-lg font-semibold text-slate-900">
        Eligible for <span className="numeric text-brand-600">{eligibleCount}</span> /{" "}
        <span className="numeric">{activeDrives.length}</span> active drives
      </p>

      {blockers.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Common blockers</p>
          <ul className="mt-1.5 space-y-1 text-sm text-slate-600">
            {blockers.map(({ count, phrase }) => (
              <li key={phrase}>
                <span className="numeric font-medium text-slate-900">{count}</span> drive{count === 1 ? "" : "s"} {phrase}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
