import { RECRUITER_ALLOWED_TRANSITIONS } from "../../utils/constants.js";

const STATUS_LABEL = {
  APPLIED: "Applied",
  SHORTLISTED: "Shortlisted",
  OA_CLEARED: "OA Cleared",
  INTERVIEW: "Interview",
  OFFERED: "Offered",
  REJECTED: "Rejected",
};

/**
 * Shows the current status as a fixed option, plus whichever next
 * statuses RECRUITER_ALLOWED_TRANSITIONS says are reachable from here -
 * purely so the dropdown doesn't offer obviously-illegal choices. The
 * backend re-validates the transition independently regardless (see
 * application.service.js's updateApplicationStatus) and is the only
 * real enforcement point.
 */
export function StatusSelector({ currentStatus, value, onChange, disabled }) {
  const nextOptions = RECRUITER_ALLOWED_TRANSITIONS[currentStatus] || [];
  const isTerminal = nextOptions.length === 0;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || isTerminal}
      className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
    >
      <option value={currentStatus}>{STATUS_LABEL[currentStatus]} (current)</option>
      {nextOptions.map((status) => (
        <option key={status} value={status}>
          Move to {STATUS_LABEL[status]}
        </option>
      ))}
    </select>
  );
}
