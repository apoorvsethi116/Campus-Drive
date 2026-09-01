export function Spinner({ size = "md", className = "" }) {
  const sizeClasses = { sm: "h-4 w-4 border-2", md: "h-6 w-6 border-2", lg: "h-10 w-10 border-[3px]" };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-spin rounded-full border-brand-500 border-t-transparent ${sizeClasses[size]} ${className}`}
    />
  );
}
