import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { Input } from "../../components/common/Input.jsx";
import { Select } from "../../components/common/Select.jsx";
import { Button } from "../../components/common/Button.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { isValidEmail, isValidPassword, isRequired, isInRange, isNonNegativeInteger } from "../../utils/validators.js";
import { ROLES, BRANCHES, DASHBOARD_PATH_BY_ROLE } from "../../utils/constants.js";

const ROLE_OPTIONS = [
  { value: ROLES.STUDENT, label: "Student" },
  { value: ROLES.TPO, label: "Placement Officer (TPO)" },
  { value: ROLES.RECRUITER, label: "Recruiter" },
];

const BRANCH_OPTIONS = BRANCHES.map((branch) => ({ value: branch, label: branch }));

const CURRENT_YEAR = new Date().getFullYear();

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
  role: ROLES.STUDENT,
  branch: "",
  currentCGPA: "",
  activeBacklogs: "0",
  tenthPercentage: "",
  twelfthPercentage: "",
  graduationYear: String(CURRENT_YEAR + 1),
};

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isStudent = form.role === ROLES.STUDENT;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validate() {
    const errors = {};
    if (!isRequired(form.name)) errors.name = "Name is required";
    if (!isValidEmail(form.email)) errors.email = "Enter a valid email address";
    if (!isValidPassword(form.password)) errors.password = "Password must be at least 8 characters";

    if (isStudent) {
      if (!isRequired(form.branch)) errors.branch = "Branch is required";
      if (!isInRange(form.currentCGPA, 0, 10)) errors.currentCGPA = "CGPA must be between 0 and 10";
      if (!isNonNegativeInteger(form.activeBacklogs)) errors.activeBacklogs = "Must be a non-negative whole number";
      if (!isInRange(form.tenthPercentage, 0, 100)) errors.tenthPercentage = "Must be between 0 and 100";
      if (!isInRange(form.twelfthPercentage, 0, 100)) errors.twelfthPercentage = "Must be between 0 and 100";
      if (!isInRange(form.graduationYear, 2000, CURRENT_YEAR + 10)) errors.graduationYear = "Enter a valid year";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      ...(isStudent && {
        studentDetails: {
          branch: form.branch,
          currentCGPA: Number(form.currentCGPA),
          activeBacklogs: Number(form.activeBacklogs),
          tenthPercentage: Number(form.tenthPercentage),
          twelfthPercentage: Number(form.twelfthPercentage),
          graduationYear: Number(form.graduationYear),
        },
      }),
    };

    setIsSubmitting(true);
    try {
      const user = await register(payload);
      navigate(DASHBOARD_PATH_BY_ROLE[user.role] || "/", { replace: true });
    } catch (error) {
      setServerError(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950">
            <GraduationCap className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Join CampusDrive AI</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6">
          <ErrorMessage error={serverError} />

          <Select
            id="role"
            name="role"
            label="I am a"
            options={ROLE_OPTIONS}
            value={form.role}
            onChange={handleChange}
          />

          <Input id="name" name="name" label="Full name" value={form.name} onChange={handleChange} error={fieldErrors.name} autoComplete="name" />

          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            value={form.email}
            onChange={handleChange}
            error={fieldErrors.email}
            autoComplete="email"
          />

          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            value={form.password}
            onChange={handleChange}
            error={fieldErrors.password}
            autoComplete="new-password"
          />

          {isStudent && (
            <div className="flex flex-col gap-4 border-t border-slate-100 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Academic details</p>

              <Select
                id="branch"
                name="branch"
                label="Branch"
                placeholder="Select your branch"
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
                id="graduationYear"
                name="graduationYear"
                type="number"
                label="Graduation year"
                value={form.graduationYear}
                onChange={handleChange}
                error={fieldErrors.graduationYear}
              />
            </div>
          )}

          <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
