import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import { tpoService } from "../../services/tpo.service.js";
import { ApplicantsTable } from "../../components/tpo/ApplicantsTable.jsx";
import { Spinner } from "../../components/common/Spinner.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";

export function DriveApplicants() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [drive, setDrive] = useState(null);
  const [applications, setApplications] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function fetchApplicants() {
      try {
        const result = await tpoService.getDriveApplicants(id);
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

    fetchApplicants();
    return () => {
      isCancelled = true;
    };
  }, [id]);

  return (
    <div>
      <button
        onClick={() => navigate("/tpo/drives")}
        className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to drives
      </button>

      <h1 className="font-display text-2xl font-semibold text-slate-900">
        {drive ? `${drive.companyName} — Applicants` : "Applicants"}
      </h1>
      <p className="mt-1 text-sm text-slate-500">{drive?.jobRole}</p>

      <div className="mt-6">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {!isLoading && error && <ErrorMessage error={error} />}

        {!isLoading && !error && applications && applications.length === 0 && (
          <EmptyState icon={Users} title="No applicants yet" description="No students have applied to this drive so far." />
        )}

        {!isLoading && !error && applications && applications.length > 0 && (
          <ApplicantsTable applications={applications} />
        )}
      </div>
    </div>
  );
}