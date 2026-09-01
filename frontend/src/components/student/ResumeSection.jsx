import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Input } from "../common/Input.jsx";
import { Button } from "../common/Button.jsx";
import { ErrorMessage } from "../common/ErrorMessage.jsx";
import { studentService } from "../../services/student.service.js";
import { isValidUrl, isRequired } from "../../utils/validators.js";

/**
 * A resume URL (Google Drive link) is compulsory before a student can
 * apply to any drive - enforced server-side in applyToDrive
 * (application.service.js). This component manages just that one
 * field, saved independently of the rest of the profile form via the
 * same PATCH /student/profile endpoint (partial update).
 */
export function ResumeSection({ profile, onUpdated }) {
  const [isEditing, setIsEditing] = useState(!profile.resumeUrl);
  const [url, setUrl] = useState(profile.resumeUrl || "");
  const [error, setError] = useState(null);
  const [fieldError, setFieldError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setError(null);
    setFieldError(null);

    if (!isRequired(url)) {
      setFieldError("Resume URL is required");
      return;
    }
    if (!isValidUrl(url)) {
      setFieldError("Enter a valid URL");
      return;
    }

    setIsSaving(true);
    try {
      const updated = await studentService.updateProfile({ resumeUrl: url });
      onUpdated(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="font-display text-base font-semibold text-slate-900">Resume</h2>

      {/* {!profile.resumeUrl && !isEditing && (
        <p className="mt-1 text-sm text-pending">Required before applying to placement drives.</p>
      )} */}

      {!isEditing && profile.resumeUrl ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <ExternalLink className="h-4 w-4" /> View Resume
          </a>
          <Button variant="secondary" onClick={() => setIsEditing(true)}>
            Update Resume
          </Button>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {!profile.resumeUrl && (
            <p className="text-sm text-pending">Required before applying to placement drives.</p>
          )}
          {error && <ErrorMessage error={error} />}
          <Input
            id="resumeUrl"
            name="resumeUrl"
            label="Google Drive Resume URL"
            placeholder="https://drive.google.com/..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setFieldError(null);
            }}
            error={fieldError}
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} isLoading={isSaving} className="w-full sm:w-auto">
              Save Resume
            </Button>
            {profile.resumeUrl && (
              <Button variant="secondary" onClick={() => { setIsEditing(false); setUrl(profile.resumeUrl); setFieldError(null); }}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}