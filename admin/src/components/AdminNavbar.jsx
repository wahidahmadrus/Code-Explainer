import { LogOut } from "lucide-react";

export default function AdminNavbar({ user, onLogout }) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur lg:ml-64">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium text-slate-500">Admin console</p>
          <p className="text-base font-semibold text-slate-950">{user?.email}</p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </button>
      </div>
    </header>
  );
}
