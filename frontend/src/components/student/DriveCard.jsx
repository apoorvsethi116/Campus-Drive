import { Link } from "react-router-dom";
import { MapPin, Clock } from "lucide-react";
import { EligibilityBadge } from "./EligibilityBadge.jsx";
import { formatCTC, formatDeadline } from "../../utils/formatters.js";

export function DriveCard({ drive }) {
  return (
    <Link
      to={`/student/drives/${drive._id}`}
      className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-base font-semibold text-slate-900">{drive.companyName}</h3>
          <p className="text-sm text-slate-500">{drive.jobRole}</p>
        </div>
        <EligibilityBadge eligible={drive.eligibility.eligible} />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {drive.location}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {formatDeadline(drive.deadline)}
        </span>
      </div>

      <div className="numeric text-sm font-semibold text-slate-900">{formatCTC(drive.ctc)}</div>
    </Link>
  );
}
