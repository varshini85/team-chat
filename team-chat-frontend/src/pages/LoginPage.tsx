import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

try {
await login(email, password);
navigate("/channels");
} catch (err: any) {
const detail =
err?.response?.data?.detail ||
err?.response?.data?.message ||
"Login failed";
setError(detail);
} finally {
setLoading(false);
}
};

  return (
<div className="min-h-screen flex items-center justify-center bg-slate-900">
<div className="w-full max-w-md bg-slate-800 rounded-2xl p-8 shadow-xl">
<h1 className="text-2xl font-semibold text-white mb-6 text-center">
Login to Team Chat
</h1>

{error && (
<p className="text-sm text-red-400 mb-3 text-center">{error}</p>
)}

<form onSubmit={handleSubmit} className="space-y-4">
<div>
<label className="block text-sm text-slate-200 mb-1">Email</label>
<input
type="email"
className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100 text-sm outline-none focus:border-indigo-500"
value={email}
onChange={(e) => setEmail(e.target.value)}
required
autoComplete="email"
/>
</div>

<div>
<label className="block text-sm text-slate-200 mb-1">
Password
</label>
<input
type="password"
className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100 text-sm outline-none focus:border-indigo-500"
value={password}
onChange={(e) => setPassword(e.target.value)}
required
autoComplete="current-password"
/>
</div>

<button
type="submit"
disabled={loading}
className="w-full rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white py-2 text-sm font-medium transition"
>
{loading ? "Logging in..." : "Login"}
</button>
</form>

<div className="mt-4 flex items-center justify-between text-xs text-slate-300">
<Link
to="/forgot-password"
className="hover:text-indigo-400 underline"
>
Forgot password?
</Link>
<span>
Don&apos;t have an account?{" "}
<Link to="/signup" className="hover:text-indigo-400 underline">
Sign up
</Link>
</span>
</div>
</div>
</div>
);
};

export default LoginPage;
