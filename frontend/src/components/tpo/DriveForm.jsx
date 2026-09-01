import { useEffect, useState } from "react";
import { Input } from "../common/Input.jsx";
import { Select } from "../common/Select.jsx";
import { Button } from "../common/Button.jsx";
import { ErrorMessage } from "../common/ErrorMessage.jsx";
import { Spinner } from "../common/Spinner.jsx";
import { tpoService } from "../../services/tpo.service.js";
import { isRequired, isInRange, isNonNegativeInteger } from "../../utils/validators.js";
import { BRANCHES, EMPLOYMENT_TYPES, DRIVE_STATUSES } from "../../utils/constants.js";

/**
 * Converts a stored ISO date string to the yyyy-mm-dd format the native
 * <input type="date"> expects. A date-only string (no time component)
 * still satisfies the backend's isISO8601() validator.
 */
function toDateInputValue(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toISOString().slice(0, 10);
}

function toFormState(drive) {
  if (!drive) {
    return {
      companyName: "",
      jobRole: "",
      description: "",
      location: "",
      employmentType: "FULL_TIME",
      ctc: "",
      minCGPA: "",
      maxBacklogs: "",
      allowedBranches: [],
      minTenthPercentage: "",
      minTwelfthPercentage: "",
      deadline: "",
      driveDate: "",
      status: "DRAFT",
      recruiters: [],
    };
  }

  return {
    companyName: drive.companyName,
    jobRole: drive.jobRole,
    description: drive.description,
    location: drive.location,
    employmentType: drive.employmentType,
    ctc: String(drive.ctc),
    minCGPA: String(drive.eligibilityCriteria.minCGPA),
    maxBacklogs: String(drive.eligibilityCriteria.maxBacklogs),
    allowedBranches: drive.eligibilityCriteria.allowedBranches,
    minTenthPercentage: String(drive.eligibilityCriteria.minTenthPercentage),
    minTwelfthPercentage: String(drive.eligibilityCriteria.minTwelfthPercentage),
    deadline: toDateInputValue(drive.deadline),
    driveDate: toDateInputValue(drive.driveDate),
    status: drive.status,
    // drive.recruiters is populated with {_id, name, email} objects by
    // the backend (see drive.controller.js's getDrive/listDrives), so
    // it's normalized down to plain IDs here for the checkbox list.
    recruiters: (drive.recruiters || []).map((r) => (typeof r === "string" ? r : r._id)),
  };
}

export function DriveForm({ initialDrive, onSubmit, isSubmitting, submitLabel, submitError }) {
  const [form, setForm] = useState(() => toFormState(initialDrive));
  const [fieldErrors, setFieldErrors] = useState({});

  const [recruiters, setRecruiters] = useState([]);
  const [recruitersError, setRecruitersError] = useState(null);
  const [isLoadingRecruiters, setIsLoadingRecruiters] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function fetchRecruiters() {
      try {
        const fetched = await tpoService.listRecruiters();
        if (!isCancelled) setRecruiters(fetched);
      } catch (err) {
        if (!isCancelled) setRecruitersError(err);
      } finally {
        if (!isCancelled) setIsLoadingRecruiters(false);
      }
    }

    fetchRecruiters();
    return () => {
      isCancelled = true;
    };
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function toggleBranch(branch) {
    setForm((prev) => ({
      ...prev,
      allowedBranches: prev.allowedBranches.includes(branch)
        ? prev.allowedBranches.filter((b) => b !== branch)
        : [...prev.allowedBranches, branch],
    }));
    setFieldErrors((prev) => ({ ...prev, allowedBranches: undefined }));
  }

  function toggleRecruiter(recruiterId) {
    setForm((prev) => ({
      ...prev,
      recruiters: prev.recruiters.includes(recruiterId)
        ? prev.recruiters.filter((id) => id !== recruiterId)
        : [...prev.recruiters, recruiterId],
    }));
  }

  function validate() {
    const errors = {};
    if (!isRequired(form.companyName)) errors.companyName = "Company name is required";
    if (!isRequired(form.jobRole)) errors.jobRole = "Job role is required";
    if (!isRequired(form.description)) errors.description = "Description is required";
    if (!isRequired(form.location)) errors.location = "Location is required";
    if (!isInRange(form.ctc, 0, Infinity)) errors.ctc = "CTC must be a non-negative number";
    if (!isInRange(form.minCGPA, 0, 10)) errors.minCGPA = "Must be between 0 and 10";
    if (!isNonNegativeInteger(form.maxBacklogs)) errors.maxBacklogs = "Must be a non-negative whole number";
    if (form.allowedBranches.length === 0) errors.allowedBranches = "Select at least one branch";
    if (!isInRange(form.minTenthPercentage, 0, 100)) errors.minTenthPercentage = "Must be between 0 and 100";
    if (!isInRange(form.minTwelfthPercentage, 0, 100)) errors.minTwelfthPercentage = "Must be between 0 and 100";
    if (!isRequired(form.deadline)) errors.deadline = "Deadline is required";
    if (!isRequired(form.driveDate)) errors.driveDate = "Drive date is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      companyName: form.companyName,
      jobRole: form.jobRole,
      description: form.description,
      location: form.location,
      employmentType: form.employmentType,
      ctc: Number(form.ctc),
      eligibilityCriteria: {
        minCGPA: Number(form.minCGPA),
        maxBacklogs: Number(form.maxBacklogs),
        allowedBranches: form.allowedBranches,
        minTenthPercentage: Number(form.minTenthPercentage),
        minTwelfthPercentage: Number(form.minTwelfthPercentage),
      },
      deadline: form.deadline,
      driveDate: form.driveDate,
      status: form.status,
      recruiters: form.recruiters,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-lg border border-slate-200 bg-white p-6">
      {submitError && <ErrorMessage error={submitError} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input id="companyName" name="companyName" label="Company name" value={form.companyName} onChange={handleChange} error={fieldErrors.companyName} />
        <Input id="jobRole" name="jobRole" label="Job role" value={form.jobRole} onChange={handleChange} error={fieldErrors.jobRole} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={form.description}
          onChange={handleChange}
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm focus-visible:ring-2 ${
            fieldErrors.description ? "border-ineligible focus-visible:ring-ineligible" : "border-slate-300 focus-visible:ring-brand-500"
          }`}
        />
        {fieldErrors.description && <p className="text-xs text-ineligible">{fieldErrors.description}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input id="location" name="location" label="Location" value={form.location} onChange={handleChange} error={fieldErrors.location} />
        <Select
          id="employmentType"
          name="employmentType"
          label="Employment type"
          options={EMPLOYMENT_TYPES}
          value={form.employmentType}
          onChange={handleChange}
        />
        <Input
          id="ctc"
          name="ctc"
          type="number"
          step="0.1"
          label="CTC (LPA)"
          value={form.ctc}
          onChange={handleChange}
          error={fieldErrors.ctc}
        />
      </div>

      <div className="border-t border-slate-100 pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Eligibility criteria</p>

        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="minCGPA"
            name="minCGPA"
            type="number"
            step="0.01"
            label="Minimum CGPA"
            value={form.minCGPA}
            onChange={handleChange}
            error={fieldErrors.minCGPA}
          />
          <Input
            id="maxBacklogs"
            name="maxBacklogs"
            type="number"
            label="Maximum backlogs"
            value={form.maxBacklogs}
            onChange={handleChange}
            error={fieldErrors.maxBacklogs}
          />
          <Input
            id="minTenthPercentage"
            name="minTenthPercentage"
            type="number"
            step="0.01"
            label="Minimum 10th %"
            value={form.minTenthPercentage}
            onChange={handleChange}
            error={fieldErrors.minTenthPercentage}
          />
          <Input
            id="minTwelfthPercentage"
            name="minTwelfthPercentage"
            type="number"
            step="0.01"
            label="Minimum 12th %"
            value={form.minTwelfthPercentage}
            onChange={handleChange}
            error={fieldErrors.minTwelfthPercentage}
          />
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium text-slate-700">Allowed branches</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {BRANCHES.map((branch) => (
              <label key={branch} className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.allowedBranches.includes(branch)}
                  onChange={() => toggleBranch(branch)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-500 focus-visible:ring-brand-500"
                />
                {branch}
              </label>
            ))}
          </div>
          {fieldErrors.allowedBranches && <p className="mt-1 text-xs text-ineligible">{fieldErrors.allowedBranches}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
        <Input
          id="deadline"
          name="deadline"
          type="date"
          label="Application deadline"
          value={form.deadline}
          onChange={handleChange}
          error={fieldErrors.deadline}
        />
        <Input
          id="driveDate"
          name="driveDate"
          type="date"
          label="Drive date"
          value={form.driveDate}
          onChange={handleChange}
          error={fieldErrors.driveDate}
        />
        <Select id="status" name="status" label="Status" options={DRIVE_STATUSES} value={form.status} onChange={handleChange} />
      </div>

      <div className="border-t border-slate-100 pt-4">
        <p className="text-sm font-medium text-slate-700">Assign recruiters</p>
        <p className="text-xs text-slate-500">Only assigned recruiters can view and manage candidates for this drive.</p>

        <div className="mt-3">
          {isLoadingRecruiters && (
            <div className="flex justify-center py-4">
              <Spinner size="sm" />
            </div>
          )}

          {!isLoadingRecruiters && recruitersError && <ErrorMessage error={recruitersError} />}

          {!isLoadingRecruiters && !recruitersError && recruiters.length === 0 && (
            <p className="text-sm text-slate-500">No recruiter accounts exist yet.</p>
          )}

          {!isLoadingRecruiters && !recruitersError && recruiters.length > 0 && (
            <div className="flex flex-col gap-2">
              {recruiters.map((recruiter) => (
                <label key={recruiter._id} className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={form.recruiters.includes(recruiter._id)}
                    onChange={() => toggleRecruiter(recruiter._id)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-500 focus-visible:ring-brand-500"
                  />
                  {recruiter.name} <span className="text-slate-400">({recruiter.email})</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full sm:w-auto">
        {submitLabel}
      </Button>
    </form>
  );
}