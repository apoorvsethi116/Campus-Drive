export function StudentTable({ students }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Branch</th>
            <th className="px-4 py-3 font-medium">CGPA</th>
            <th className="px-4 py-3 font-medium">Backlogs</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {students.map((student) => (
            <tr key={student._id}>
              <td className="px-4 py-3 font-medium text-slate-900">{student.user?.name || "-"}</td>
              <td className="px-4 py-3 text-slate-600">{student.user?.email || "-"}</td>
              <td className="px-4 py-3 text-slate-600">{student.branch}</td>
              <td className="numeric px-4 py-3 text-slate-600">{student.currentCGPA}</td>
              <td className="numeric px-4 py-3 text-slate-600">{student.activeBacklogs}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
