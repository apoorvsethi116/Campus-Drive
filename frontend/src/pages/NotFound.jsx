import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 text-center">
      <Compass className="mb-4 h-10 w-10 text-slate-300" aria-hidden="true" />
      <h1 className="font-display text-xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-1 text-sm text-slate-500">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-6 text-sm font-medium text-brand-600 hover:text-brand-700">
        Go back home
      </Link>
    </div>
  );
}
