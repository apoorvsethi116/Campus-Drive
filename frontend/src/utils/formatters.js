/**
 * CTC is stored and entered as a plain Number representing LPA (lakhs
 * per annum) directly - e.g. 12.5 means "12.5 LPA". It is NOT stored in
 * raw rupees, so no unit conversion happens here.
 */
export function formatCTC(ctc) {
  if (ctc === undefined || ctc === null) return "-";
  return `Rs. ${Number(ctc).toFixed(1)} LPA`;
}

export function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Returns a short, human-readable countdown string for a deadline.
 * Used on drive cards/details so a student doesn't have to do date math
 * themselves to know if a deadline is urgent or already passed.
 */
export function formatDeadline(deadline) {
  if (!deadline) return "-";
  const diffMs = new Date(deadline).getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) return "Deadline passed";
  if (diffDays === 0) return "Deadline today";
  if (diffDays === 1) return "1 day left";
  return `${diffDays} days left`;
}