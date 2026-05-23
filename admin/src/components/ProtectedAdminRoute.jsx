import { Navigate } from "react-router-dom";

export default function ProtectedAdminRoute({ user, authLoading, children }) {
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-sm text-slate-600">
        Checking admin access...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-soft">
          <h1 className="text-xl font-semibold text-slate-950">Access denied</h1>
          <p className="mt-2 text-sm text-slate-600">You do not have admin access.</p>
        </div>
      </div>
    );
  }

  return children;
}
