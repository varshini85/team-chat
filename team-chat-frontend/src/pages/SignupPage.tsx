import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const SignupPage: React.FC = () => {
const { signup } = useAuth();
const navigate = useNavigate();
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setError("");
try {
await signup(name, email, password);
navigate("/channels");
} catch (err: any) {
setError(err?.response?.data?.detail || "Signup failed");
}
};

  return (
<div style={{ padding: 24, maxWidth: 400, margin: "40px auto" }}>
<h1>Sign up</h1>
{error && <p style={{ color: "red" }}>{error}</p>}
<form onSubmit={handleSubmit}>
<label>
Name
<input style={{ display: "block", width: "100%", marginBottom: 8 }} value={name} onChange={(e) => setName(e.target.value)} required />
</label>
<label>
Email
<input style={{ display: "block", width: "100%", marginBottom: 8 }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
</label>
<label>
Password
<input style={{ display: "block", width: "100%", marginBottom: 8 }} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
</label>
<button type="submit">Create account</button>
<p style={{ marginTop: 8 }}>
Already have an account? <Link to="/login">Login</Link>
</p>
</form>
</div>
);
};

export default SignupPage;
