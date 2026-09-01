import { useEffect, useState } from "react";
import { Search, Briefcase } from "lucide-react";
import { studentService } from "../../services/student.service.js";
import { useDebounce } from "../../hooks/useDebounce.js";
import { DriveCard } from "../../components/student/DriveCard.jsx";
import { Spinner } from "../../components/common/Spinner.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";

export function PlacementDrives() {
  const [drives, setDrives] = useState(null); // null = not loaded yet, [] = loaded but empty
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    let isCancelled = false;

    async function fetchDrives() {
      setIsLoading(true);
      setError(null);
      try {
        const params = {};
        if (debouncedSearch) params.search = debouncedSearch;
        if (eligibleOnly) params.eligibleOnly = "true";

        const { drives: fetchedDrives } = await studentService.listDrives(params);
        if (!isCancelled) setDrives(fetchedDrives);
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
  }, [debouncedSearch, eligibleOnly]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">Placement Drives</h1>
      <p className="mt-1 text-sm text-slate-500">Browse open drives and check your eligibility.</p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company or role"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus-visible:ring-2 focus-visible:ring-brand-500"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={eligibleOnly}
            onChange={(e) => setEligibleOnly(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-500 focus-visible:ring-brand-500"
          />
          Eligible only
        </label>
      </div>

      <div className="mt-6">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {!isLoading && error && <ErrorMessage error={error} />}

        {!isLoading && !error && drives && drives.length === 0 && (
          <EmptyState
            icon={Briefcase}
            title="No placement drives found"
            description="Try changing your search or filters."
          />
        )}

        {!isLoading && !error && drives && drives.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {drives.map((drive) => (
              <DriveCard key={drive._id} drive={drive} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
