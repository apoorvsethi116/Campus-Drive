import { useEffect, useState } from "react";
import { studentService } from "../../services/student.service.js";
import { ProfileCompletion } from "../../components/student/ProfileCompletion.jsx";
import { ResumeSection } from "../../components/student/ResumeSection.jsx";
import { Input } from "../../components/common/Input.jsx";
import { Select } from "../../components/common/Select.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Spinner } from "../../components/common/Spinner.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { isInRange, isNonNegativeInteger, isRequired } from "../../utils/validators.js";
import { BRANCHES } from "../../utils/constants.js";

const BRANCH_OPTIONS = BRANCHES.map((branch) => ({ value: branch, label: branch }));

/**
 * Only the fields the backend's updateProfileValidator actually accepts
 * (see validators/student.validator.js) are editable here. graduationYear
 * is intentionally NOT included - it isn't in EDITABLE_PROFILE_FIELDS on
 * the backend, so exposing an editable field the server silently ignores
 * would be misleading. resumeUrl is deliberately NOT part of this form -
 * it's managed independently by ResumeSection below.
 */
function toFormState(profile) {
  return {
    branch: profile.branch || "",
    currentCGPA: String(profile.currentCGPA ?? ""),
    activeBacklogs: String(profile.activeBacklogs ?? 0),
    tenthPercentage: String(profile.tenthPercentage ?? ""),
    twelfthPercentage: String(profile.twelfthPercentage ?? ""),
    phone: profile.phone || "",
    skills: (profile.skills || []).join(", "),
    collegeId: profile.collegeId || "",
  };
}

export function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function fetchProfile() {
      try {
        const fetched = await studentService.getProfile();
        if (!isCancelled) {
          setProfile(fetched);
          setForm(toFormState(fetched));
        }
      } catch (err) {
        if (!isCancelled) setLoadError(err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    fetchProfile();
    return () => {
      isCancelled = true;
    };
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setSaveSuccess(false);
  }

  function validate() {
    const errors = {};
    if (!isRequired(form.branch)) errors.branch = "Branch is required";
    if (!isInRange(form.currentCGPA, 0, 10)) errors.currentCGPA = "CGPA must be between 0 and 10";
    if (!isNonNegativeInteger(form.activeBacklogs)) errors.activeBacklogs = "Must be a non-negative whole number";
    if (!isInRange(form.tenthPercentage, 0, 100)) errors.tenthPercentage = "Must be between 0 and 100";
    if (!isInRange(form.twelfthPercentage, 0, 100)) errors.twelfthPercentage = "Must be between 0 and 100";
    if (form.phone && !/^\d{10}$/.test(form.phone)) errors.phone = "Must be exactly 10 digits";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);
    if (!validate()) return;

    const payload = {
      branch: form.branch,
      currentCGPA: Number(form.currentCGPA),
      activeBacklogs: Number(form.activeBacklogs),
      tenthPercentage: Number(form.tenthPercentage),
      twelfthPercentage: Number(form.twelfthPercentage),
      phone: form.phone,
      skills: form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      collegeId: form.collegeId,
    };

    setIsSaving(true);
    try {
      const updated = await studentService.updateProfile(payload);
      setProfile(updated);
      setForm(toFormState(updated));
      setSaveSuccess(true);
    } catch (err) {
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

  if (loadError) {
    return <ErrorMessage error={loadError} />;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-slate-900">My Profile</h1>
      <p className="mt-1 text-sm text-slate-500">Keep your academic details up to date.</p>

      <div className="mt-4">
        <ProfileCompletion profile={profile} />
      </div>

      <div className="mt-4">
        <ResumeSection profile={profile} onUpdated={setProfile} />
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6">
        {saveError && <ErrorMessage error={saveError} />}
        {saveSuccess && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-eligible">
            Profile updated successfully.
          </div>
        )}

        <Input id="collegeId" name="collegeId" label="College ID" value={form.collegeId} onChange={handleChange} />

        <Select
          id="branch"
          name="branch"
          label="Branch"
          options={BRANCH_OPTIONS}
          value={form.branch}
          onChange={handleChange}
          error={fieldErrors.branch}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="currentCGPA"
            name="currentCGPA"
            type="number"
            step="0.01"
            label="Current CGPA"
            value={form.currentCGPA}
            onChange={handleChange}
            error={fieldErrors.currentCGPA}
          />
          <Input
            id="activeBacklogs"
            name="activeBacklogs"
            type="number"
            label="Active backlogs"
            value={form.activeBacklogs}
            onChange={handleChange}
            error={fieldErrors.activeBacklogs}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="tenthPercentage"
            name="tenthPercentage"
            type="number"
            step="0.01"
            label="10th %"
            value={form.tenthPercentage}
            onChange={handleChange}
            error={fieldErrors.tenthPercentage}
          />
          <Input
            id="twelfthPercentage"
            name="twelfthPercentage"
            type="number"
            step="0.01"
            label="12th %"
            value={form.twelfthPercentage}
            onChange={handleChange}
            error={fieldErrors.twelfthPercentage}
          />
        </div>

        <Input
          id="phone"
          name="phone"
          label="Phone number"
          value={form.phone}
          onChange={handleChange}
          error={fieldErrors.phone}
          placeholder="10-digit phone number"
        />

        <Input
          id="skills"
          name="skills"
          label="Skills"
          value={form.skills}
          onChange={handleChange}
          placeholder="Comma-separated, e.g. React, Node.js, SQL"
        />

        <Button type="submit" isLoading={isSaving} className="mt-2 w-full sm:w-auto">
          Save changes
        </Button>
      </form>
    </div>
  );
}