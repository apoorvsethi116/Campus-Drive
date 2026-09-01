import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Briefcase, PlusCircle } from "lucide-react";
import { tpoService } from "../../services/tpo.service.js";
import { useDebounce } from "../../hooks/useDebounce.js";
import { DriveTable } from "../../components/tpo/DriveTable.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Spinner } from "../../components/common/Spinner.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { ConfirmDialog } from "../../components/common/ConfirmDialog.jsx";
import { DRIVE_STATUSES } from "../../utils/constants.js";

export function Drives() {
  const [drives, setDrives] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  const [driveToDelete, setDriveToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function fetchDrives() {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      const { drives: fetched } = await tpoService.listDrives(params);
      setDrives(fetched);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchDrives();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter]);

  async function handleConfirmDelete() {
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await tpoService.deleteDrive(driveToDelete._id);
      setDriveToDelete(null);
      await fetchDrives();
    } catch (err) {
      // Most likely the backend's 409 "has existing applications" guard
      // (see drive.controller.js's deleteDrive) - shown right in the
      // dialog rather than closing it, so the TPO sees why it failed.
      setDeleteError(err);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Placement Drives</h1>
          <p className="mt-1 text-sm text-slate-500">Manage all placement drives.</p>
        </div>
        <Link to="/tpo/drives/create">
          <Button>
            <PlusCircle className="h-4 w-4" /> Create Drive
          </Button>
        </Link>
      </div>

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
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <option value="">All statuses</option>
          {DRIVE_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
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

        {!isLoading && !error && drives && drives.length === 0 && (
          <EmptyState
            icon={Briefcase}
            title="No placement drives found"
            description="Try changing your filters, or create a new drive."
          />
        )}

        {!isLoading && !error && drives && drives.length > 0 && (
          <DriveTable drives={drives} onDeleteClick={setDriveToDelete} />
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(driveToDelete)}
        title="Delete this drive?"
        description={
          deleteError
            ? deleteError.message
            : `This will permanently delete "${driveToDelete?.companyName}". This cannot be undone.`
        }
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDriveToDelete(null);
          setDeleteError(null);
        }}
      />
    </div>
  );
}
