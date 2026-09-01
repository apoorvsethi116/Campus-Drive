import { Badge } from "../common/Badge.jsx";

/**
 * Maps every status in Application.model.js's APPLICATION_STATUSES
 * enum (unchanged since Phase 1) to a visual tone. Kept as a flat
 * object, not a class or lookup service - this is presentation only,
 * matching the "simple object" pattern used for the backend's own
 * ALLOWED_TRANSITIONS map (Phase 5).
 */
const STATUS_CONFIG = {
  APPLIED: { tone: "neutral", label: "Applied" },
  SHORTLISTED: { tone: "pending", label: "Shortlisted" },
  OA_CLEARED: { tone: "pending", label: "OA Cleared" },
  INTERVIEW: { tone: "pending", label: "Interview" },
  OFFERED: { tone: "eligible", label: "Offered" },
  REJECTED: { tone: "ineligible", label: "Rejected" },
  WITHDRAWN: { tone: "neutral", label: "Withdrawn" },
};

export function ApplicationStatus({ status }) {
  const config = STATUS_CONFIG[status] || { tone: "neutral", label: status };
  return <Badge tone={config.tone}>{config.label}</Badge>;
}
