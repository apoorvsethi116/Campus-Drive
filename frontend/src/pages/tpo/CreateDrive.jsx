import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { tpoService } from "../../services/tpo.service.js";
import { DriveForm } from "../../components/tpo/DriveForm.jsx";

export function CreateDrive() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  async function handleSubmit(payload) {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const drive = await tpoService.createDrive(payload);
      navigate(`/tpo/drives/${drive._id}/edit`, { replace: true });
    } catch (err) {
      setSubmitError(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate("/tpo/drives")}
        className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to drives
      </button>

      <h1 className="font-display text-2xl font-semibold text-slate-900">Create Placement Drive</h1>
      <p className="mt-1 text-sm text-slate-500">Set eligibility criteria carefully - students see these immediately.</p>

      <div className="mt-6">
        <DriveForm onSubmit={handleSubmit} isSubmitting={isSubmitting} submitLabel="Create Drive" submitError={submitError} />
      </div>
    </div>
  );
}
