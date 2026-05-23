import { useState } from "react";
import AuthForm from "../components/AuthForm.jsx";
import { signup } from "../services/auth.js";

export default function Signup({ onNavigate, onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    setLoading(true);

    try {
      const auth = await signup({ name, email, password });
      onSuccess(auth);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not create account.");
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
        mode="signup"
        name={name}
        onEmailChange={setEmail}
        onNameChange={setName}
        onPasswordChange={setPassword}
        onSubmit={handleSubmit}
        onSwitch={() => onNavigate("login")}
        password={password}
      />
    </div>
  );
}
