import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  UserCircle,
  Users,
  PlusCircle,
  Building2,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { ROLES } from "../../utils/constants.js";

const NAV_ITEMS_BY_ROLE = {
  [ROLES.STUDENT]: [
    { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/student/drives", label: "Placement Drives", icon: Briefcase },
    { to: "/student/applications", label: "My Applications", icon: FileText },
    { to: "/student/profile", label: "My Profile", icon: UserCircle },
  ],
  [ROLES.TPO]: [
    { to: "/tpo/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/tpo/drives", label: "Placement Drives", icon: Briefcase },
    { to: "/tpo/drives/create", label: "Create Drive", icon: PlusCircle },
    { to: "/tpo/students", label: "Students", icon: Users },
  ],
  [ROLES.RECRUITER]: [
    { to: "/recruiter/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/recruiter/drives", label: "My Drives", icon: Building2 },
  ],
};

export function Sidebar() {
  const { user } = useAuth();
  const items = NAV_ITEMS_BY_ROLE[user?.role] || [];

  return (
    <nav className="flex h-full flex-col gap-1 px-3 py-4" aria-label="Main navigation">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-brand-500/15 text-brand-100"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
