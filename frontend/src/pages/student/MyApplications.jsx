import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { studentService } from "../../services/student.service.js";
import { ApplicationStatus } from "../../components/student/ApplicationStatus.jsx";
import { Spinner } from "../../components/common/Spinner.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { ConfirmDialog } from "../../components/common/ConfirmDialog.jsx";
import { formatCTC, formatDate } from "../../utils/formatters.js";
import { WITHDRAWABLE_STATUSES } from "../../utils/constants.js";

export function MyApplications() {
  const [applications, setApplications] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [applicationToWithdraw, setApplicationToWithdraw] = useState(null);
  const [withdrawError, setWithdrawError] = useState(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  async function fetchApplications() {
    setIsLoading(true);
    setError(null);
    try {
      const { applications: fetched } = await studentService.listApplications();
      setApplications(fetched);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchApplications();
  }, []);

  async function handleConfirmWithdraw() {
    setWithdrawError(null);
    setIsWithdrawing(true);
    try {
      await studentService.withdrawApplication(applicationToWithdraw._id);
      setApplicationToWithdraw(null);
      await fetchApplications();
    } catch (err) {
      // Most likely the backend rejecting because the application has
      // already reached a terminal state since this page was loaded
      // (see withdrawApplication in application.service.js).
      setWithdrawError(err);
    } finally {
      setIsWithdrawing(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">My Applications</h1>
      <p className="mt-1 text-sm text-slate-500">Track the status of every drive you've applied to.</p>

      <div className="mt-6">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {!isLoading && error && <ErrorMessage error={error} />}

        {!isLoading && !error && applications && applications.length === 0 && (
          <EmptyState
            icon={FileText}
            title="You haven't applied to any drives yet"
            description="Browse placement drives and apply to the ones you're eligible for."
            action={
              <Link to="/student/drives" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                Browse drives
              </Link>
            }
          />
        )}

        {!isLoading && !error && applications && applications.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">CTC</th>
                  <th className="px-4 py-3 font-medium">Applied On</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((application) => (
                  <tr key={application._id}>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {application.drive?.companyName || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{application.drive?.jobRole || "-"}</td>
                    <td className="numeric px-4 py-3 text-slate-600">{formatCTC(application.drive?.ctc)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(application.appliedAt)}</td>
                    <td className="px-4 py-3">
                      <ApplicationStatus status={application.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {WITHDRAWABLE_STATUSES.includes(application.status) && (
                        <button
                          onClick={() => setApplicationToWithdraw(application)}
                          className="text-sm font-medium text-ineligible hover:underline"
                        >
                          Withdraw
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(applicationToWithdraw)}
        title="Withdraw this application?"
        description={
          withdrawError
            ? withdrawError.message
            : `You're withdrawing your application to ${applicationToWithdraw?.drive?.companyName}. This cannot be undone.`
        }
        confirmLabel="Withdraw"
        isLoading={isWithdrawing}
        onConfirm={handleConfirmWithdraw}
        onCancel={() => {
          setApplicationToWithdraw(null);
          setWithdrawError(null);
        }}
      />
    </div>
  );
}
