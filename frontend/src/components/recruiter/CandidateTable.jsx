import { Link } from "react-router-dom";
import { ApplicationStatus } from "../student/ApplicationStatus.jsx";
import { formatDate } from "../../utils/formatters.js";

/**
 * Reuses ApplicationStatus unchanged from the student side (Phase 7) -
 * a candidate's status means exactly the same thing whether a student
 * or a recruiter is looking at it, so it's the same component.
 */
export function CandidateTable({ driveId, applications }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Candidate</th>
            <th className="px-4 py-3 font-medium">Branch</th>
            <th className="px-4 py-3 font-medium">CGPA</th>
            <th className="px-4 py-3 font-medium">Applied On</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {applications.map((application) => (
            <tr key={application._id} className="cursor-pointer hover:bg-slate-50">
              <td className="px-0 py-0">
                <Link
                  to={`/recruiter/drives/${driveId}/candidates/${application._id}`}
                  className="block px-4 py-3 font-medium text-slate-900"
                >
                  {application.student?.user?.name || "-"}
                  <span className="block text-xs font-normal text-slate-500">{application.student?.user?.email}</span>
                </Link>
              </td>
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
