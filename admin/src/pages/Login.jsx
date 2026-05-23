import { LockKeyhole } from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

export default function Login({ user, onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (user?.role === "admin") {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await onLogin(email, password);
      navigate("/", { replace: true });
    } catch (loginError) {
      setError(loginError.message || "Could not log in.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-teal-50 text-teal-700">
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Code Explainer</p>
            <h1 className="text-xl font-semibold text-slate-950">Admin login</h1>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="focus-ring mt-1 block min-h-11 w-full rounded-md border border-slate-300 px-3 text-slate-950"
              autoComplete="email"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="focus-ring mt-1 block min-h-11 w-full rounded-md border border-slate-300 px-3 text-slate-950"
              autoComplete="current-password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="focus-ring inline-flex min-h-11 w-full items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Checking access..." : "Log in"}
          </button>
        </form>
      </section>
    </main>
  );
}
