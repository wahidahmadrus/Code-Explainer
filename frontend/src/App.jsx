import { useEffect, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Practice from "./pages/Practice.jsx";
import SavedSnippets from "./pages/SavedSnippets.jsx";
import Signup from "./pages/Signup.jsx";
import { getCurrentUser, getStoredAuth, logout } from "./services/auth.js";

export default function App() {
  const [page, setPage] = useState("practice");
  const [auth, setAuth] = useState(() => getStoredAuth());

  useEffect(() => {
    const storedAuth = getStoredAuth();

    if (!storedAuth?.token) {
      return;
    }

    getCurrentUser(storedAuth.token)
      .then(setAuth)
      .catch(() => setAuth(null));
  }, []);

  function handleLogout() {
    logout();
    setAuth(null);
    setPage("practice");
  }

  function handleAuthSuccess(nextAuth) {
    setAuth(nextAuth);
    setPage("practice");
  }

  function renderPage() {
    if (page === "home") {
      return <Home onStart={() => setPage("practice")} />;
    }

    if (page === "login") {
      return <Login onNavigate={setPage} onSuccess={handleAuthSuccess} />;
    }

    if (page === "signup") {
      return <Signup onNavigate={setPage} onSuccess={handleAuthSuccess} />;
    }

    if (page === "snippets") {
      return <SavedSnippets auth={auth} onNavigate={setPage} />;
    }

    return <Practice auth={auth} onNavigate={setPage} />;
  }

  return (
    <div className="min-h-screen bg-stone-50 text-zinc-950">
      <Navbar auth={auth} currentPage={page} onLogout={handleLogout} onNavigate={setPage} />
      <main>{renderPage()}</main>
    </div>
  );
}
