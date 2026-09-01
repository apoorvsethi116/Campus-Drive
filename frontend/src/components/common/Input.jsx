export function Input({ label, id, error, className = "", ...rest }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 ${
          error ? "border-ineligible focus-visible:ring-ineligible" : "border-slate-300 focus-visible:ring-brand-500"
        } ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-ineligible">
          {error}
        </p>
      )}
    </div>
  );
}
