import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, GraduationCap, FileText as ResumeIcon } from "lucide-react";
import { recruiterService } from "../../services/recruiter.service.js";
import { ApplicationStatus } from "../../components/student/ApplicationStatus.jsx";
import { StatusSelector } from "../../components/recruiter/StatusSelector.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Spinner } from "../../components/common/Spinner.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";

/**
 * There is no dedicated "get single application" endpoint for
 * recruiters (only the students-facing side has one - see Phase 3's
 * GET /student/applications/:id). Rather than inventing a new backend
 * endpoint for this, candidate details are found from the same
 * listCandidates response already used by the Candidates list page -
 * that response already includes everything this page needs (full
 * student profile, application status, notes). Reusing the existing
 * endpoint here is intentional, not a shortcut.
 */
export function CandidateDetails() {
  const { driveId, applicationId } = useParams();
  const navigate = useNavigate();

  const [drive, setDrive] = useState(null);
  const [application, setApplication] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [pendingStatus, setPendingStatus] = useState(null);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function fetchCandidate() {
      try {
        const result = await recruiterService.listCandidates(driveId);
        const found = result.applications.find((a) => a._id === applicationId);
        if (!isCancelled) {
          if (!found) {
            setLoadError({ message: "Candidate not found for this drive" });
          } else {
            setDrive(result.drive);
            setApplication(found);
            setNotes(found.recruiterNotes || "");
            setPendingStatus(found.status);
          }
        }
      } catch (err) {
        if (!isCancelled) setLoadError(err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    fetchCandidate();
    return () => {
      isCancelled = true;
    };
  }, [driveId, applicationId]);

  async function handleSave() {
    setSaveError(null);
    setSaveSuccess(false);

    const payload = {};
    if (pendingStatus !== application.status) payload.status = pendingStatus;
    if (notes !== (application.recruiterNotes || "")) payload.recruiterNotes = notes;

    if (Object.keys(payload).length === 0) return;

    setIsSaving(true);
    try {
      const updated = await recruiterService.updateApplicationStatus(applicationId, payload);
      setApplication((prev) => ({ ...prev, ...updated }));
      setPendingStatus(updated.status);
      setSaveSuccess(true);
    } catch (err) {
      // Covers both a rejected transition (400) and an unrelated-drive
      // 403, translated by the backend into a clear message either way.
      setSaveError(err);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (loadError) return <ErrorMessage error={loadError} />;
  if (!application) return null;

  const student = application.student;
  const hasUnsavedChanges = pendingStatus !== application.status || notes !== (application.recruiterNotes || "");

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={() => navigate(`/recruiter/drives/${driveId}/candidates`)}
        className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to candidates
      </button>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-xl font-semibold text-slate-900">{student?.user?.name}</h1>
            <p className="text-sm text-slate-500">Applying for {drive?.jobRole}</p>
          </div>
          <ApplicationStatus status={application.status} />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <span className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-slate-400" /> {student?.user?.email}
          </span>
          {student?.phone && (
            <span className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400" /> {student.phone}
            </span>
          )}
          <span className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-slate-400" />
            {student?.branch} - CGPA {student?.currentCGPA}, {student?.activeBacklogs} backlog(s)
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {student?.user?.email && (
            <a
              href={`mailto:${student.user.email}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Mail className="h-4 w-4" /> Email Candidate
            </a>
          )}
          {student?.resumeUrl && (
            <a
              href={student.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <ResumeIcon className="h-4 w-4" /> View Resume
            </a>
          )}
        </div>

        {student?.skills?.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Skills</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {student.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 border-t border-slate-100 pt-5">
          {saveError && (
            <div className="mb-3">
              <ErrorMessage error={saveError} />
            </div>
          )}
          {saveSuccess && (
            <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-eligible">
              Saved successfully.
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-1.5 text-sm font-medium text-slate-700">Application status</p>
              <StatusSelector
                currentStatus={application.status}
                value={pendingStatus}
                onChange={setPendingStatus}
                disabled={isSaving}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="recruiterNotes" className="text-sm font-medium text-slate-700">
                Recruiter notes
              </label>
              <textarea
                id="recruiterNotes"
                rows={4}
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setSaveSuccess(false);
                }}
                placeholder="Internal notes about this candidate..."
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus-visible:ring-2 focus-visible:ring-brand-500"
              />
            </div>

            <Button onClick={handleSave} isLoading={isSaving} disabled={!hasUnsavedChanges} className="w-full sm:w-auto">
              Save changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}