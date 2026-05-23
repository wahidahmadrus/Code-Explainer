import { Activity, Code2, Gauge, Languages, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: Gauge },
  { to: "/users", label: "Users", icon: Users },
  { to: "/snippets", label: "Snippets", icon: Code2 },
  { to: "/ai-requests", label: "AI Requests", icon: Activity },
  { to: "/languages", label: "Languages", icon: Languages },
];

export default function AdminSidebar() {
  return (
    <aside className="border-b border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex h-16 items-center border-b border-slate-200 px-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Code Explainer</p>
          <h1 className="text-lg font-semibold text-slate-950">Admin</h1>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:block lg:space-y-1 lg:overflow-visible">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                [
                  "focus-ring flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition",
                  isActive ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                ].join(" ")
              }
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="whitespace-nowrap">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
