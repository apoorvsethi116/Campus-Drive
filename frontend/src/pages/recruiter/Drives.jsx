import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Users } from "lucide-react";
import { recruiterService } from "../../services/recruiter.service.js";
import { Badge } from "../../components/common/Badge.jsx";
import { Spinner } from "../../components/common/Spinner.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { formatCTC, formatDate } from "../../utils/formatters.js";

const STATUS_TONE = {
  DRAFT: "neutral",
  OPEN: "eligible",
  CLOSED: "ineligible",
  COMPLETED: "brand",
};

export function Drives() {
  const [drives, setDrives] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function fetchDrives() {
      try {
        const { drives: fetched } = await recruiterService.listDrives();
        if (!isCancelled) setDrives(fetched);
      } catch (err) {
        if (!isCancelled) setError(err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    fetchDrives();
    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">My Drives</h1>
      <p className="mt-1 text-sm text-slate-500">Drives you've been assigned to as a recruiter.</p>

      <div className="mt-6">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {!isLoading && error && <ErrorMessage error={error} />}

        {!isLoading && !error && drives && drives.length === 0 && (
          <EmptyState
            icon={Building2}
            title="No drives assigned yet"
            description="Your placement office will assign you to drives you'll recruit for."
          />
        )}

        {!isLoading && !error && drives && drives.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {drives.map((drive) => (
              <Link
                key={drive._id}
                to={`/recruiter/drives/${drive._id}/candidates`}
                className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-base font-semibold text-slate-900">{drive.companyName}</h3>
                    <p className="text-sm text-slate-500">{drive.jobRole}</p>
                  </div>
                  <Badge tone={STATUS_TONE[drive.status] || "neutral"}>{drive.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Deadline {formatDate(drive.deadline)}</span>
                  <span className="numeric font-medium text-slate-700">{formatCTC(drive.ctc)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-brand-600">
                  <Users className="h-4 w-4" /> View candidates
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
