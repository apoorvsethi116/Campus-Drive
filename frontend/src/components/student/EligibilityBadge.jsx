import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "../common/Badge.jsx";

/**
 * Thin wrapper around the shared Badge component (Phase 6) specifically
 * for eligibility. Never recomputes eligibility itself - always renders
 * exactly what the backend's checkEligibility() function returned, so
 * this can never drift from the actual server-side decision (see
 * eligibility.service.js, reused unchanged since Phase 3).
 */
export function EligibilityBadge({ eligible }) {
  return (
    <Badge tone={eligible ? "eligible" : "ineligible"}>
      {eligible ? (
        <>
          <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Eligible
        </>
      ) : (
        <>
          <XCircle className="h-3 w-3" aria-hidden="true" /> Not Eligible
        </>
      )}
    </Badge>
  );
}
