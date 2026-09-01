import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, FileText } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { studentService } from "../../services/student.service.js";
import { ProfileCompletion } from "../../components/student/ProfileCompletion.jsx";
import { PlacementReadiness } from "../../components/student/PlacementReadiness.jsx";
import { DriveCard } from "../../components/student/DriveCard.jsx";
import { Spinner } from "../../components/common/Spinner.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";

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

export function Dashboard() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function fetchDashboardData() {
      try {
        const [fetchedProfile, drivesResult, applicationsResult] = await Promise.all([
          studentService.getProfile(),
          studentService.listDrives(),
          studentService.listApplications(),
        ]);

        if (!isCancelled) {
          setProfile(fetchedProfile);
          setDrives(drivesResult.drives);
          setApplications(applicationsResult.applications);
        }
      } catch (err) {
        if (!isCancelled) setError(err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    fetchDashboardData();
    return () => {
      isCancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  const eligibleDrives = drives.filter((d) => d.eligibility.eligible);
  const topEligibleDrives = eligibleDrives.slice(0, 3);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">Welcome, {user?.name}</h1>
      <p className="mt-1 text-sm text-slate-500">Here's what's happening with your placements.</p>

      <div className="mt-4">
        <ProfileCompletion profile={profile} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PlacementReadiness drives={drives} />
        </div>
        <StatCard icon={FileText} label="Applications Submitted" value={applications.length} />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-slate-900">Drives you're eligible for</h2>
          <Link to="/student/drives" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View all
          </Link>
        </div>

        <div className="mt-4">
          {topEligibleDrives.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No eligible drives right now"
              description="Check back later, or make sure your profile is complete and up to date."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topEligibleDrives.map((drive) => (
                <DriveCard key={drive._id} drive={drive} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
