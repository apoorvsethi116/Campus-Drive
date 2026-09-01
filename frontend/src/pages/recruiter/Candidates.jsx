import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, Users, ArrowLeft } from "lucide-react";
import { recruiterService } from "../../services/recruiter.service.js";
import { CandidateTable } from "../../components/recruiter/CandidateTable.jsx";
import { Spinner } from "../../components/common/Spinner.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { APPLICATION_STATUSES } from "../../utils/constants.js";

export function Candidates() {
  const { driveId } = useParams();
  const navigate = useNavigate();

  const [drive, setDrive] = useState(null);
  const [applications, setApplications] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function fetchCandidates() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await recruiterService.listCandidates(driveId, { status: statusFilter || undefined });
        if (!isCancelled) {
          setDrive(result.drive);
          setApplications(result.applications);
        }
      } catch (err) {
        if (!isCancelled) setError(err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    fetchCandidates();
    return () => {
      isCancelled = true;
    };
  }, [driveId, statusFilter]);

  // Client-side search: the backend's listCandidates endpoint only
  // supports server-side status filtering, not a name/email search
  // param (see recruiter.service.js), so this filters the already
  // server-scoped, already-fetched list.
  const visibleApplications = (applications || []).filter((application) => {
    if (!searchInput) return true;
    const searchLower = searchInput.toLowerCase();
    return (
      application.student?.user?.name?.toLowerCase().includes(searchLower) ||
      application.student?.user?.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      <button
        onClick={() => navigate("/recruiter/drives")}
        className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to my drives
      </button>

      <h1 className="font-display text-2xl font-semibold text-slate-900">
        {drive ? `${drive.companyName} - Candidates` : "Candidates"}
      </h1>
      <p className="mt-1 text-sm text-slate-500">{drive?.jobRole}</p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidates by name or email"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus-visible:ring-2 focus-visible:ring-brand-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <option value="">All statuses</option>
          {APPLICATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {!isLoading && error && <ErrorMessage error={error} />}

        {!isLoading && !error && visibleApplications.length === 0 && (
          <EmptyState
            icon={Users}
            title="No candidates found"
            description="Try changing your search or status filter."
          />
        )}

        {!isLoading && !error && visibleApplications.length > 0 && (
          <CandidateTable driveId={driveId} applications={visibleApplications} />
        )}
      </div>
    </div>
  );
}
