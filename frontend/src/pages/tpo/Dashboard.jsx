import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { tpoService } from "../../services/tpo.service.js";
import { PlacementStats } from "../../components/tpo/PlacementStats.jsx";
import { Button } from "../../components/common/Button.jsx";
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
        const fetched = await tpoService.getDashboardStats();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Welcome, {user?.name}</h1>
          <p className="mt-1 text-sm text-slate-500">Placement cell overview.</p>
        </div>
        <Link to="/tpo/drives/create">
          <Button>
            <PlusCircle className="h-4 w-4" /> Create Drive
          </Button>
        </Link>
      </div>

      <div className="mt-6">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}
        {!isLoading && error && <ErrorMessage error={error} />}
        {!isLoading && !error && stats && <PlacementStats stats={stats} />}
      </div>
    </div>
  );
}
