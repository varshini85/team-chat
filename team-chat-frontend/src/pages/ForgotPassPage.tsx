import React, { useState } from "react";
import type { FormEvent } from "react";
import { forgotPassword, verifyOtp, setNewPassword } from "../api/auth";
import { Link, useNavigate } from "react-router-dom";

type Step = "EMAIL" | "OTP" | "NEW_PASSWORD";

const ForgotPassPage: React.FC = () => {
const navigate = useNavigate();

const [step, setStep] = useState<Step>("EMAIL");
const [email, setEmail] = useState("");
const [otp, setOtp] = useState("");
const [newPassword, setNewPasswordValue] = useState("");

const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [message, setMessage] = useState<string | null>(null);

const handleEmailSubmit = async (e?: FormEvent) => {
e?.preventDefault();
setLoading(true);
setError(null);
setMessage(null);
try {
const data = await forgotPassword({ email: email.trim() });
setMessage(data?.message || "OTP sent to your email");
setStep("OTP");
} catch (err: any) {
console.error("forgotPassword error:", err);
const detail =
err?.response?.data?.detail ??
err?.response?.data?.message ??
err?.message ??
"Failed to send OTP";
setError(detail);
} finally {
setLoading(false);
}
};

const handleResendOtp = async () => {
if (!email.trim()) {
setError("Enter email to resend OTP.");
return;
}
await handleEmailSubmit();
};

const handleOtpSubmit = async (e: FormEvent) => {
e.preventDefault();
setLoading(true);
setError(null);
setMessage(null);
try {
const data = await verifyOtp({ email: email.trim(), otp: otp.trim() });
setMessage(data?.message || "OTP verified");
setStep("NEW_PASSWORD");
} catch (err: any) {
console.error("verifyOtp error:", err);
const detail =
err?.response?.data?.detail ??
err?.response?.data?.message ??
err?.message ??
"Invalid OTP";
setError(detail);
} finally {
setLoading(false);
}
};

const handleNewPasswordSubmit = async (e: FormEvent) => {
e.preventDefault();
setLoading(true);
setError(null);
setMessage(null);
try {
const data = await setNewPassword({
email: email.trim(),
new_password: newPassword,
});
setMessage(data?.message || "Password changed successfully");
navigate("/login");
} catch (err: any) {
console.error("setNewPassword error:", err);
const detail =
err?.response?.data?.detail ??
err?.response?.data?.message ??
err?.message ??
"Failed to change password";
setError(detail);
} finally {
setLoading(false);
}
};

return (
<div className="auth-page">
<div className="auth-card">
<h1 className="auth-title">Reset password</h1>
<p className="text-xs" style={{ textAlign: "center", marginBottom: 12 }}>
Step {step === "EMAIL" ? "1" : step === "OTP" ? "2" : "3"} of 3
</p>

{error && <p className="auth-error">{error}</p>}
{message && <p style={{ color: "#34d399", textAlign: "center" }}>{message}</p>}

{step === "EMAIL" && (
<form className="auth-form" onSubmit={(e) => handleEmailSubmit(e)}>
<div className="auth-field">
<label className="auth-label">Enter your account email</label>
<input
className="auth-input"
type="email"
value={email}
onChange={(ev) => setEmail(ev.target.value)}
required
autoComplete="email"
/>
</div>
<button className="auth-button" disabled={loading || !email.trim()}>
{loading ? "Sending OTP..." : "Send OTP"}
</button>
</form>
)}

{step === "OTP" && (
<form className="auth-form" onSubmit={handleOtpSubmit}>
<p style={{ fontSize: 12, color: "#9ca3af" }}>
We have sent a 6-digit code to: <strong>{email}</strong>
</p>
<div className="auth-field">
<label className="auth-label">Enter OTP</label>
<input
className="auth-input"
inputMode="numeric"
pattern="\d*"
type="text"
value={otp}
onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
required
maxLength={6}
/>
</div>
<button className="auth-button" disabled={loading || otp.trim().length !== 6}>
{loading ? "Verifying..." : "Verify OTP"}
</button>
<button
type="button"
onClick={handleResendOtp}
className="auth-button"
style={{ marginTop: 8, background: "transparent", border: "1px solid #374151", color: "#e5e7eb" }}
>
Resend OTP
</button>
</form>
)}

{step === "NEW_PASSWORD" && (
<form className="auth-form" onSubmit={handleNewPasswordSubmit}>
<div className="auth-field">
<label className="auth-label">New password</label>
<input
className="auth-input"
type="password"
value={newPassword}
onChange={(e) => setNewPasswordValue(e.target.value)}
required
autoComplete="new-password"
/>
</div>
<button className="auth-button" disabled={loading || newPassword.length < 6}>
{loading ? "Updating..." : "Set new password"}
</button>
</form>
)}

<div className="auth-footer">
Remembered your password? <Link to="/login">Back to login</Link>
</div>
</div>
</div>
);
};

export default ForgotPassPage;
