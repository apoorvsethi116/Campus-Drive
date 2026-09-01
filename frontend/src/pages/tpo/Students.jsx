import { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
import { tpoService } from "../../services/tpo.service.js";
import { useDebounce } from "../../hooks/useDebounce.js";
import { StudentTable } from "../../components/tpo/StudentTable.jsx";
import { Select } from "../../components/common/Select.jsx";
import { Spinner } from "../../components/common/Spinner.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { BRANCHES } from "../../utils/constants.js";

const BRANCH_FILTER_OPTIONS = [{ value: "", label: "All branches" }, ...BRANCHES.map((b) => ({ value: b, label: b }))];

export function Students() {
  const [students, setStudents] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [branch, setBranch] = useState("");
  const [minCGPA, setMinCGPA] = useState("");
  const [maxBacklogs, setMaxBacklogs] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);
  const debouncedMinCGPA = useDebounce(minCGPA, 400);
  const debouncedMaxBacklogs = useDebounce(maxBacklogs, 400);

  useEffect(() => {
    let isCancelled = false;

    async function fetchStudents() {
      setIsLoading(true);
      setError(null);
      try {
        const params = {};
        if (debouncedSearch) params.search = debouncedSearch;
        if (branch) params.branch = branch;
        if (debouncedMinCGPA) params.minCGPA = debouncedMinCGPA;
        if (debouncedMaxBacklogs) params.maxBacklogs = debouncedMaxBacklogs;

        const { students: fetched } = await tpoService.listStudents(params);
        if (!isCancelled) setStudents(fetched);
      } catch (err) {
        if (!isCancelled) setError(err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    fetchStudents();
    return () => {
      isCancelled = true;
    };
  }, [debouncedSearch, branch, debouncedMinCGPA, debouncedMaxBacklogs]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">Students</h1>
      <p className="mt-1 text-sm text-slate-500">Search and filter registered students.</p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="relative sm:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus-visible:ring-2 focus-visible:ring-brand-500"
          />
        </div>
        <Select id="branch-filter" options={BRANCH_FILTER_OPTIONS} value={branch} onChange={(e) => setBranch(e.target.value)} />
        <input
          type="number"
          step="0.01"
          placeholder="Min CGPA"
          value={minCGPA}
          onChange={(e) => setMinCGPA(e.target.value)}
          className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus-visible:ring-2 focus-visible:ring-brand-500"
        />
      </div>

      <div className="mt-3 max-w-xs">
        <input
          type="number"
          placeholder="Max backlogs"
          value={maxBacklogs}
          onChange={(e) => setMaxBacklogs(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus-visible:ring-2 focus-visible:ring-brand-500"
        />
      </div>

      <div className="mt-6">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {!isLoading && error && <ErrorMessage error={error} />}

        {!isLoading && !error && students && students.length === 0 && (
          <EmptyState icon={Users} title="No students found" description="Try changing your search or filters." />
        )}

        {!isLoading && !error && students && students.length > 0 && <StudentTable students={students} />}
      </div>
    </div>
  );
}
