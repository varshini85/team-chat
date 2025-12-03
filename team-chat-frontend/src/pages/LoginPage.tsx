import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const LoginPage: React.FC = () => {
const { login } = useAuth();
const navigate = useNavigate();
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setError("");
try {
await login(email, password);
navigate("/channels");
} catch (err: any) {
setError(err?.response?.data?.detail || "Login failed");
}
};

  return (
<div style={{ padding: 24, maxWidth: 400, margin: "40px auto" }}>
<h1>Login</h1>
{error && <p style={{ color: "red" }}>{error}</p>}
<form onSubmit={handleSubmit}>
<label>
Email
<input style={{ display: "block", width: "100%", marginBottom: 8 }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
</label>
<label>
Password
<input style={{ display: "block", width: "100%", marginBottom: 8 }} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
</label>
<button type="submit">Login</button>
<p style={{ marginTop: 8 }}>
Don&apos;t have an account? <Link to="/signup">Sign up</Link>
</p>
</form>
</div>
);
};

export default LoginPage;
