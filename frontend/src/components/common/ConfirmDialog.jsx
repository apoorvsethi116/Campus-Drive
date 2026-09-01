import { Button } from "./Button.jsx";

/**
 * A minimal confirmation modal. Not built in Phase 6 because nothing
 * needed it yet - drive deletion (Phase 8) is the first destructive
 * action in the app that genuinely warrants a confirmation step before
 * firing.
 */
export function ConfirmDialog({ isOpen, title, description, confirmLabel = "Confirm", isLoading, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-950/40" onClick={onCancel} aria-hidden="true" />
      <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <h2 className="font-display text-base font-semibold text-slate-900">{title}</h2>
        {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
