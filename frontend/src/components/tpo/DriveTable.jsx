import { Link } from "react-router-dom";
import { Pencil, Trash2, Users, ClipboardList } from "lucide-react";
import { Badge } from "../common/Badge.jsx";
import { formatCTC, formatDate } from "../../utils/formatters.js";

const STATUS_TONE = {
  DRAFT: "neutral",
  OPEN: "eligible",
  CLOSED: "ineligible",
  COMPLETED: "brand",
};

export function DriveTable({ drives, onDeleteClick }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Company</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">CTC</th>
            <th className="px-4 py-3 font-medium">Deadline</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {drives.map((drive) => (
            <tr key={drive._id}>
              <td className="px-4 py-3 font-medium text-slate-900">{drive.companyName}</td>
              <td className="px-4 py-3 text-slate-600">{drive.jobRole}</td>
              <td className="numeric px-4 py-3 text-slate-600">{formatCTC(drive.ctc)}</td>
              <td className="px-4 py-3 text-slate-600">{formatDate(drive.deadline)}</td>
              <td className="px-4 py-3">
                <Badge tone={STATUS_TONE[drive.status] || "neutral"}>{drive.status}</Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    to={`/tpo/drives/${drive._id}/edit`}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    title="Edit drive"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <Link
                    to={`/tpo/drives/${drive._id}/applicants`}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    title="View applicants"
                  >
                    <ClipboardList className="h-4 w-4" />
                  </Link>
                  <Link
                    to={`/tpo/drives/${drive._id}/edit`}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    title="View eligible students"
                  >
                    <Users className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => onDeleteClick(drive)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-ineligible"
                    title="Delete drive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}