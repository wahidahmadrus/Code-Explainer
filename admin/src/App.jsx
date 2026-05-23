import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import AdminLayout from "./components/AdminLayout.jsx";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute.jsx";
import AiRequests from "./pages/AiRequests.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Languages from "./pages/Languages.jsx";
import Login from "./pages/Login.jsx";
import Snippets from "./pages/Snippets.jsx";
import Users from "./pages/Users.jsx";
import { getCurrentAdmin, loginAdmin, logoutAdmin } from "./services/adminAuth.js";

function AdminRoutes() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadAdmin() {
      try {
        const currentUser = await getCurrentAdmin();

        if (isMounted) {
          setUser(currentUser);
        }
      } catch {
        logoutAdmin();
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    }

    loadAdmin();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleLogin(email, password) {
    const data = await loginAdmin(email, password);
    setUser(data.user);
  }

  function handleLogout() {
    logoutAdmin();
    setUser(null);
    navigate("/login", { replace: true });
  }

  return (
    <Routes>
      <Route path="/login" element={<Login user={user} onLogin={handleLogin} />} />
      <Route
        element={
          <ProtectedAdminRoute user={user} authLoading={authLoading}>
            <AdminLayout user={user} onLogout={handleLogout} />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users currentUser={user} />} />
        <Route path="snippets" element={<Snippets />} />
        <Route path="ai-requests" element={<AiRequests />} />
        <Route path="languages" element={<Languages />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminRoutes />
    </BrowserRouter>
  );
}
