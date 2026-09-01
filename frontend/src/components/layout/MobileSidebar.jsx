import { X } from "lucide-react";
import { Sidebar } from "./Sidebar.jsx";

export function MobileSidebar({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-slate-950/50" onClick={onClose} aria-hidden="true" />
      <div className="relative flex h-full w-72 flex-col bg-slate-950">
        <div className="flex items-center justify-between px-4 py-4">
          <span className="font-display text-lg font-semibold text-white">CampusDrive AI</span>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto" onClick={onClose}>
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
