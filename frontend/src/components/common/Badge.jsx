const TONE_STYLES = {
  eligible: "bg-emerald-50 text-eligible",
  ineligible: "bg-red-50 text-ineligible",
  pending: "bg-amber-50 text-pending",
  neutral: "bg-slate-100 text-slate-600",
  brand: "bg-brand-50 text-brand-700",
};

const TONE_DOT = {
  eligible: "bg-eligible",
  ineligible: "bg-ineligible",
  pending: "bg-pending",
  neutral: "bg-slate-400",
  brand: "bg-brand-500",
};

/**
 * The one recurring visual motif of this app: a colored dot + label.
 * Used for eligibility (Phase 7+), drive status, and application status
 * everywhere they appear, so the same visual language always means the
 * same thing regardless of which page you're on.
 */
export function Badge({ tone = "neutral", children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${TONE_STYLES[tone]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[tone]}`} aria-hidden="true" />
      {children}
    </span>
  );
}
