import { Check, X } from "lucide-react";

/**
 * Explainable Eligibility (product differentiator).
 *
 * Renders the `checks` array exactly as returned by the backend's
 * checkEligibility() function (see eligibility.service.js) - one line
 * per criterion, each already carrying its own pass/fail state and
 * message. This component does NOT decide eligibility itself; it only
 * displays what the backend already decided. If the backend's rules
 * ever change, this list updates automatically with zero changes here.
 */
export function EligibilityChecklist({ checks }) {
  return (
    <ul className="space-y-1.5">
      {checks.map((check) => (
        <li
          key={check.key}
          className={`flex items-start gap-2 text-sm ${check.passed ? "text-slate-700" : "text-ineligible"}`}
        >
          {check.passed ? (
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-eligible" aria-hidden="true" />
          ) : (
            <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-ineligible" aria-hidden="true" />
          )}
          {check.message}
        </li>
      ))}
    </ul>
  );
}
