import { Outlet } from "react-router-dom";
import AdminNavbar from "./AdminNavbar.jsx";
import AdminSidebar from "./AdminSidebar.jsx";

export default function AdminLayout({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <AdminNavbar user={user} onLogout={onLogout} />
      <main className="lg:ml-64">
        <Outlet />
      </main>
    </div>
  );
}
