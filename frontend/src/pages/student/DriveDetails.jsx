import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapPin, Calendar, Clock, ArrowLeft } from "lucide-react";
import { studentService } from "../../services/student.service.js";
import { EligibilityBadge } from "../../components/student/EligibilityBadge.jsx";
import { EligibilityChecklist } from "../../components/student/EligibilityChecklist.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Spinner } from "../../components/common/Spinner.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { formatCTC, formatDate, formatDeadline } from "../../utils/formatters.js";

export function DriveDetails() {
  const { driveId } = useParams();
  const navigate = useNavigate();

  const [drive, setDrive] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [hasResume, setHasResume] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState(null);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function fetchDetails() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [result, profile] = await Promise.all([
          studentService.getDriveDetails(driveId),
          studentService.getProfile(),
        ]);
        if (!isCancelled) {
          setDrive(result.drive);
          setEligibility(result.eligibility);
          setHasResume(Boolean(profile.resumeUrl));
        }
      } catch (err) {
        if (!isCancelled) setLoadError(err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    fetchDetails();
    return () => {
      isCancelled = true;
    };
  }, [driveId]);

  async function handleApply() {
    setApplyError(null);
    setIsApplying(true);
    try {
      await studentService.applyToDrive(driveId);
      setApplySuccess(true);
    } catch (err) {
      // Covers every failure mode the backend's applyToDrive service can
      // throw (see application.service.js): missing resume (400),
      // not eligible (403, with err.errors as the reasons list), drive
      // not open / deadline passed (400), or duplicate application
      // (409). All render the same way here since the message itself
      // is already clear.
      setApplyError(err);
    } finally {
      setIsApplying(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (loadError) {
    return <ErrorMessage error={loadError} />;
  }

  if (!drive) return null;

  const canApply = eligibility.eligible && drive.status === "OPEN" && hasResume && !applySuccess;

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to drives
      </button>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-xl font-semibold text-slate-900">{drive.companyName}</h1>
            <p className="text-sm text-slate-500">{drive.jobRole}</p>
          </div>
          <EligibilityBadge eligible={eligibility.eligible} />
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-slate-400" /> {drive.location}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-slate-400" /> Drive on {formatDate(drive.driveDate)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-400" /> {formatDeadline(drive.deadline)}
          </span>
        </div>

        <div className="numeric mt-4 text-lg font-semibold text-slate-900">{formatCTC(drive.ctc)}</div>

        <p className="mt-4 whitespace-pre-line text-sm text-slate-700">{drive.description}</p>

        <div className="mt-6 rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Eligibility</p>
          <div className="mt-2">
            <EligibilityChecklist checks={eligibility.checks} />
          </div>
        </div>

        {eligibility.eligible && !hasResume && !applySuccess && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-pending">
            Please add your resume before applying.{" "}
            <Link to="/student/profile" className="font-medium underline">
              Add resume
            </Link>
          </div>
        )}

        {applySuccess ? (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-eligible">
            Application submitted successfully.{" "}
            <button onClick={() => navigate("/student/applications")} className="font-medium underline">
              View my applications
            </button>
          </div>
        ) : (
          <div className="mt-6">
            {applyError && (
              <div className="mb-3">
                <ErrorMessage error={applyError} />
              </div>
            )}
            <Button onClick={handleApply} isLoading={isApplying} disabled={!canApply} className="w-full sm:w-auto">
              {drive.status !== "OPEN" ? "Applications closed" : "Apply now"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}