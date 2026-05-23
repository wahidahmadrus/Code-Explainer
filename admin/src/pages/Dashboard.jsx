import { Activity, Code2, Languages, Users } from "lucide-react";
import { useEffect, useState } from "react";
import DataTable from "../components/DataTable.jsx";
import StatCard from "../components/StatCard.jsx";
import { getDashboardStats } from "../services/adminApi.js";

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  return new Date(value).toLocaleString();
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        const data = await getDashboardStats();

        if (isMounted) {
          setStats(data);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || "Could not load dashboard.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <div className="page-shell text-sm text-slate-600">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="page-shell text-sm text-red-700">{error}</div>;
  }

  return (
    <div className="page-shell space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">Monitor users, saved work, and AI activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={stats.totalUsers} icon={Users} />
        <StatCard label="Total snippets" value={stats.totalSnippets} icon={Code2} />
        <StatCard label="AI requests" value={stats.totalAiRequests} icon={Activity} />
        <StatCard label="Languages" value={stats.totalLanguages} icon={Languages} />
      </div>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-slate-950">Recent users</h3>
          <DataTable
            columns={[
              { key: "name", header: "Name", render: (row) => row.name || "No name" },
              { key: "email", header: "Email" },
              { key: "role", header: "Role" },
              { key: "createdAt", header: "Created", render: (row) => formatDate(row.createdAt) },
            ]}
            rows={stats.recentUsers || []}
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-semibold text-slate-950">Recent AI requests</h3>
          <DataTable
            columns={[
              { key: "requestType", header: "Type" },
              { key: "language", header: "Language" },
              { key: "user", header: "User", render: (row) => row.user?.email || "Anonymous" },
              { key: "createdAt", header: "Created", render: (row) => formatDate(row.createdAt) },
            ]}
            rows={stats.recentAiRequests || []}
          />
        </div>
      </section>
    </div>
  );
}
