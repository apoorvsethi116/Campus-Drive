import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { recruiterService } from "../../services/recruiter.service.js";
import { RecruitmentStats } from "../../components/recruiter/RecruitmentStats.jsx";
import { Spinner } from "../../components/common/Spinner.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function fetchStats() {
      try {
        const fetched = await recruiterService.getDashboardStats();
        if (!isCancelled) setStats(fetched);
      } catch (err) {
        if (!isCancelled) setError(err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    fetchStats();
    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">Welcome, {user?.name}</h1>
      <p className="mt-1 text-sm text-slate-500">An overview of your assigned drives and candidates.</p>

      <div className="mt-6">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}
        {!isLoading && error && <ErrorMessage error={error} />}
        {!isLoading && !error && stats && <RecruitmentStats stats={stats} />}
      </div>
    </div>
  );
}
