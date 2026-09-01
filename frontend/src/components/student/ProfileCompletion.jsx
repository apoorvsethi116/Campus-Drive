import { Link } from "react-router-dom";
import { CheckCircle2, AlertTriangle } from "lucide-react";

/**
 * Mirrors backend's REQUIRED_FOR_COMPLETION list exactly (see
 * controllers/student/student.controller.js) so the "what's missing"
 * list shown here always matches what actually flips
 * profile.profileCompleted server-side - this is presentational only,
 * it doesn't decide completion itself, it just explains the boolean
 * the backend already computed.
 */
const REQUIRED_FIELDS = [
  { key: "branch", label: "Branch" },
  { key: "currentCGPA", label: "Current CGPA" },
  { key: "tenthPercentage", label: "10th percentage" },
  { key: "twelfthPercentage", label: "12th percentage" },
  { key: "graduationYear", label: "Graduation year" },
  { key: "resumeUrl", label: "Resume URL" },
];

export function ProfileCompletion({ profile }) {
  if (profile.profileCompleted) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-eligible">
        <CheckCircle2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        Your profile is complete.
      </div>
    );
  }

  const missing = REQUIRED_FIELDS.filter(
    (field) => profile[field.key] === undefined || profile[field.key] === null || profile[field.key] === ""
  );

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-pending">
      <div className="flex items-center gap-2 font-medium">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        Complete your profile to apply to drives
      </div>
      {missing.length > 0 && (
        <p className="mt-1 text-amber-700">Missing: {missing.map((f) => f.label).join(", ")}</p>
      )}
      <Link to="/student/profile" className="mt-2 inline-block font-medium underline">
        Complete profile
      </Link>
    </div>
  );
}
