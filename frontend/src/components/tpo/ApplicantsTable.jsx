import { ApplicationStatus } from "../student/ApplicationStatus.jsx";
import { formatDate } from "../../utils/formatters.js";

export function ApplicantsTable({ applications }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Student</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Branch</th>
            <th className="px-4 py-3 font-medium">CGPA</th>
            <th className="px-4 py-3 font-medium">Applied On</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {applications.map((application) => (
            <tr key={application._id}>
              <td className="px-4 py-3 font-medium text-slate-900">{application.student?.user?.name || "-"}</td>
              <td className="px-4 py-3 text-slate-600">{application.student?.user?.email || "-"}</td>
              <td className="px-4 py-3 text-slate-600">{application.student?.branch}</td>
              <td className="numeric px-4 py-3 text-slate-600">{application.student?.currentCGPA}</td>
              <td className="px-4 py-3 text-slate-600">{formatDate(application.appliedAt)}</td>
              <td className="px-4 py-3">
                <ApplicationStatus status={application.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}