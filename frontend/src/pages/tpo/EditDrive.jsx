import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { tpoService } from "../../services/tpo.service.js";
import { DriveForm } from "../../components/tpo/DriveForm.jsx";
import { EligibilityBadge } from "../../components/student/EligibilityBadge.jsx";
import { Spinner } from "../../components/common/Spinner.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";

function EligibleStudentsSection({ driveId }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function fetchEligible() {
      try {
        const fetched = await tpoService.getEligibleStudents(driveId);
        if (!isCancelled) setResult(fetched);
      } catch (err) {
        if (!isCancelled) setError(err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    fetchEligible();
    return () => {
      isCancelled = true;
    };
  }, [driveId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (error) return <ErrorMessage error={error} />;
  if (!result) return null;

  const totalStudents = result.eligibleCount + result.ineligibleCount;
  if (totalStudents === 0) {
    return <EmptyState title="No students in the system yet" description="Eligibility can't be evaluated until students register." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-6 text-sm text-slate-600">
        <span>
          <span className="numeric font-semibold text-eligible">{result.eligibleCount}</span> eligible
        </span>
        <span>
          <span className="numeric font-semibold text-ineligible">{result.ineligibleCount}</span> not eligible
        </span>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900">Eligible students</h3>
        {result.eligible.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No students currently meet this drive's criteria.</p>
        ) : (
          <div className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {result.eligible.map(({ profile }) => (
              <div key={profile._id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{profile.user?.name}</p>
                  <p className="text-slate-500">
                    {profile.branch} - CGPA {profile.currentCGPA}
                  </p>
                </div>
                <EligibilityBadge eligible={true} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900">Not eligible</h3>
        {result.ineligible.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Every registered student meets this drive's criteria.</p>
        ) : (
          <div className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {result.ineligible.map(({ profile, reasons }) => (
              <div key={profile._id} className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{profile.user?.name}</p>
                    <p className="text-slate-500">
                      {profile.branch} - CGPA {profile.currentCGPA}
                    </p>
                  </div>
                  <EligibilityBadge eligible={false} />
                </div>
                <ul className="mt-1 list-inside list-disc text-xs text-slate-500">
                  {reasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function EditDrive() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [drive, setDrive] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function fetchDrive() {
      try {
        const fetched = await tpoService.getDrive(id);
        if (!isCancelled) setDrive(fetched);
      } catch (err) {
        if (!isCancelled) setLoadError(err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    fetchDrive();
    return () => {
      isCancelled = true;
    };
  }, [id]);

  async function handleSubmit(payload) {
    setSubmitError(null);
    setSaveSuccess(false);
    setIsSubmitting(true);
    try {
      const updated = await tpoService.updateDrive(id, payload);
      setDrive(updated);
      setSaveSuccess(true);
    } catch (err) {
      setSubmitError(err);
    } finally {
      setIsSubmitting(false);
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
  if (!drive) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate("/tpo/drives")}
        className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to drives
      </button>

      <h1 className="font-display text-2xl font-semibold text-slate-900">Edit {drive.companyName}</h1>
      <p className="mt-1 text-sm text-slate-500">Update drive details, or review eligible students below.</p>

      {saveSuccess && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-eligible">
          Drive updated successfully.
        </div>
      )}

      <div className="mt-6">
        <DriveForm
          initialDrive={drive}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Save Changes"
          submitError={submitError}
        />
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg font-semibold text-slate-900">Eligible Students</h2>
        <p className="mt-1 text-sm text-slate-500">
          Computed live using the same eligibility engine students see when browsing drives.
        </p>
        <div className="mt-4">
          <EligibleStudentsSection driveId={id} />
        </div>
      </div>
    </div>
  );
}
