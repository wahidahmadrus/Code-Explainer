import { useState } from "react";
import AuthForm from "../components/AuthForm.jsx";
import { login } from "../services/auth.js";

export default function Login({ onNavigate, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    setLoading(true);

    try {
      const auth = await login({ email, password });
      onSuccess(auth);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not log in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <AuthForm
        email={email}
        error={error}
        loading={loading}
        mode="login"
        onEmailChange={setEmail}
        onNameChange={() => {}}
        onPasswordChange={setPassword}
        onSubmit={handleSubmit}
        onSwitch={() => onNavigate("signup")}
        password={password}
      />
    </div>
  );
}
