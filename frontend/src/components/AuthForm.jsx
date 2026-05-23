import { AlertTriangle, Mail, Lock } from "lucide-react";
import Button from "./Button.jsx";

export default function AuthForm({
  email,
  error,
  loading,
  mode,
  name,
  onEmailChange,
  onNameChange,
  onPasswordChange,
  onSubmit,
  onSwitch,
  password,
}) {
  const isLogin = mode === "login";

  return (
    <form onSubmit={onSubmit} className="mx-auto grid w-full max-w-md gap-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
      <div>
        <p className="text-xs font-semibold uppercase text-teal-700">{isLogin ? "Welcome back" : "Create account"}</p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-950">{isLogin ? "Log in" : "Sign up"}</h1>
      </div>

      {error ? (
        <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800">
          <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      {!isLogin ? (
        <label className="grid gap-2 text-sm font-medium text-zinc-800">
          Name
          <input
            type="text"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            className="focus-ring h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-950"
            placeholder="Your name"
            required
          />
        </label>
      ) : null}

      <label className="grid gap-2 text-sm font-medium text-zinc-800">
        Email
        <div className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3">
          <Mail aria-hidden="true" className="h-4 w-4 text-zinc-400" />
          <input
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            className="focus-ring h-10 min-w-0 flex-1 border-0 bg-transparent text-sm text-zinc-950 outline-none"
            placeholder="you@example.com"
            required
          />
        </div>
      </label>

      <label className="grid gap-2 text-sm font-medium text-zinc-800">
        Password
        <div className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3">
          <Lock aria-hidden="true" className="h-4 w-4 text-zinc-400" />
          <input
            type="password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            className="focus-ring h-10 min-w-0 flex-1 border-0 bg-transparent text-sm text-zinc-950 outline-none"
            placeholder="At least 6 characters"
            required
          />
        </div>
      </label>

      <Button type="submit" disabled={loading}>
        {loading ? "Please wait" : isLogin ? "Log in" : "Create account"}
      </Button>

      <button type="button" onClick={onSwitch} className="focus-ring rounded-lg py-2 text-sm font-medium text-teal-700 hover:text-teal-800">
        {isLogin ? "Need an account? Sign up" : "Already have an account? Log in"}
      </button>
    </form>
  );
}
