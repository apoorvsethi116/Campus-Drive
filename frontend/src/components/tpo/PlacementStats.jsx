import { Users, Briefcase, FileText, Award, TrendingUp } from "lucide-react";

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <p className="numeric text-xl font-semibold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

/**
 * Renders exactly the fields returned by GET /api/tpo/dashboard (see
 * dashboard.controller.js) - nothing invented, nothing recomputed.
 */
export function PlacementStats({ stats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard icon={Users} label="Total Students" value={stats.totalStudents} />
      <StatCard icon={Briefcase} label="Active Drives" value={stats.activeDrives} />
      <StatCard icon={FileText} label="Total Applications" value={stats.totalApplications} />
      <StatCard icon={Award} label="Total Offers" value={stats.totalOffers} />
      <StatCard icon={TrendingUp} label="Placement %" value={`${stats.placementPercentage}%`} />
    </div>
  );
}
