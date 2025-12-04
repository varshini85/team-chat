import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const SignupPage: React.FC = () => {
const { signup } = useAuth();
const navigate = useNavigate();
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setError(null);
setLoading(true);

try {
await signup(name, email, password);
navigate("/channels");
} catch (err: any) {
const detail =
err?.response?.data?.detail ||
err?.response?.data?.message ||
"Signup failed";
setError(detail);
} finally {
setLoading(false);
}
};

return (
<div className="auth-page">
<div className="auth-card">
<h1 className="auth-title">Create your Team Chat account</h1>

{error && <p className="auth-error">{error}</p>}

<form onSubmit={handleSubmit} className="auth-form">
<div className="auth-field">
<label className="auth-label">Name</label>
<input
className="auth-input"
value={name}
onChange={(e) => setName(e.target.value)}
required
/>
</div>

<div className="auth-field">
<label className="auth-label">Email</label>
<input
type="email"
className="auth-input"
value={email}
onChange={(e) => setEmail(e.target.value)}
required
autoComplete="email"
/>
</div>

<div className="auth-field">
<label className="auth-label">Password</label>
<input
type="password"
className="auth-input"
value={password}
onChange={(e) => setPassword(e.target.value)}
required
autoComplete="new-password"
/>
</div>

<button
type="submit"
disabled={loading}
className="auth-button"
>
{loading ? "Creating account..." : "Sign up"}
</button>
</form>

<div className="auth-footer">
Already have an account? <Link to="/login">Login</Link>
</div>
</div>
</div>
);
};

export default SignupPage;
