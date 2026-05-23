import { useEffect, useState } from "react";
import DataTable from "../components/DataTable.jsx";
import { getUsers, updateUserRole } from "../services/adminApi.js";

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : "Unknown";
}

export default function Users({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState("");

  async function loadUsers() {
    setError("");
    setIsLoading(true);

    try {
      setUsers(await getUsers());
    } catch (loadError) {
      setError(loadError.message || "Could not load users.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleRoleChange(userId, role) {
    setError("");
    setUpdatingUserId(userId);

    try {
      const updatedUser = await updateUserRole(userId, role);
      setUsers((currentUsers) => currentUsers.map((user) => (user.id === userId ? updatedUser : user)));
    } catch (updateError) {
      setError(updateError.message || "Could not update the user role.");
    } finally {
      setUpdatingUserId("");
    }
  }

  return (
    <div className="page-shell space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Users</h2>
        <p className="mt-1 text-sm text-slate-500">Review accounts and manage admin access.</p>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      {isLoading ? <p className="text-sm text-slate-600">Loading users...</p> : null}

      {!isLoading ? (
        <DataTable
          columns={[
            { key: "name", header: "Name", render: (row) => row.name || "No name" },
            { key: "email", header: "Email" },
            {
              key: "role",
              header: "Role",
              render: (row) => {
                const isSelf = row.id === currentUser?.id;

                return (
                  <select
                    value={row.role}
                    disabled={updatingUserId === row.id || isSelf}
                    onChange={(event) => handleRoleChange(row.id, event.target.value)}
                    className="focus-ring min-h-10 rounded-md border border-slate-300 bg-white px-2 text-sm disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                    title={isSelf ? "You cannot remove your own admin role here." : "Change user role"}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                );
              },
            },
            { key: "createdAt", header: "Created", render: (row) => formatDate(row.createdAt) },
          ]}
          rows={users}
        />
      ) : null}
    </div>
  );
}
