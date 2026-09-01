import { AlertCircle } from "lucide-react";

/**
 * Renders a server/network error consistently. Expects the normalized
 * error shape produced by services/api.js's response interceptor:
 * { message, errors? }.
 */
export function ErrorMessage({ error }) {
  if (!error) return null;

  const message = typeof error === "string" ? error : error.message;
  const fieldErrors = typeof error === "object" ? error.errors : undefined;

  return (
    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-ineligible">
      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <div>
        <p>{message}</p>
        {Array.isArray(fieldErrors) && fieldErrors.length > 0 && (
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            {fieldErrors.map((fieldError, index) => (
              <li key={index}>{fieldError.message}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
