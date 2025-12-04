import React, { useState } from "react";
import type { FormEvent } from "react";
import {
  forgotPassword,
  verifyOtp,
  setNewPassword,
} from "../api/auth";
import { Link, useNavigate } from "react-router-dom";

type Step = "EMAIL" | "OTP" | "NEW_PASSWORD";

const ForgotPasswordPage: React.FC = () => {
const navigate = useNavigate();

const [step, setStep] = useState<Step>("EMAIL");
const [email, setEmail] = useState("");
const [otp, setOtp] = useState("");
const [newPassword, setNewPasswordValue] = useState("");

const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [message, setMessage] = useState<string | null>(null);

const handleEmailSubmit = async (e: FormEvent) => {
e.preventDefault();
setLoading(true);
setError(null);
setMessage(null);

try {
const data = await forgotPassword({ email });
setMessage(data.message || "OTP sent to your email");
setStep("OTP");
} catch (err: any) {
const detail =
err?.response?.data?.detail ??
err?.response?.data?.message ??
"Failed to send OTP";
setError(detail);
} finally {
setLoading(false);
}
};

const handleOtpSubmit = async (e: FormEvent) => {
e.preventDefault();
setLoading(true);
setError(null);
setMessage(null);

try {
const data = await verifyOtp({ email, otp });
setMessage(data.message || "OTP verified");
setStep("NEW_PASSWORD");
} catch (err: any) {
const detail =
err?.response?.data?.detail ??
err?.response?.data?.message ??
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
email,
new_password: newPassword,
});
setMessage(data.message || "Password changed successfully");

setTimeout(() => {
navigate("/login");
}, 800);
} catch (err: any) {
const detail =
err?.response?.data?.detail ??
err?.response?.data?.message ??
"Failed to change password";
setError(detail);
} finally {
setLoading(false);
}
};

const renderEmailStep = () => (
<form onSubmit={handleEmailSubmit} className="space-y-4">
<div>
<label className="block text-sm text-slate-200 mb-1">
Enter your account email
</label>
<input
type="email"
className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100 text-sm outline-none focus:border-indigo-500"
value={email}
onChange={(e) => setEmail(e.target.value)}
required
autoComplete="email"
/>
</div>
<button
type="submit"
disabled={loading}
className="w-full rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white py-2 text-sm font-medium transition"
>
{loading ? "Sending OTP..." : "Send OTP"}
</button>
</form>
);

const renderOtpStep = () => (
<form onSubmit={handleOtpSubmit} className="space-y-4">
<p className="text-xs text-slate-300">
We have sent a 6-digit code to:{" "}
<span className="font-semibold">{email}</span>
</p>
<div>
<label className="block text-sm text-slate-200 mb-1">
Enter OTP
</label>
<input
type="text"
className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100 text-sm outline-none focus:border-indigo-500 tracking-[0.3em]"
value={otp}
onChange={(e) => setOtp(e.target.value)}
required
maxLength={6}
/>
</div>
<button
type="submit"
disabled={loading}
className="w-full rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white py-2 text-sm font-medium transition"
>
{loading ? "Verifying..." : "Verify OTP"}
</button>
<button
type="button"
onClick={handleEmailSubmit}
disabled={loading}
className="w-full rounded-lg border border-slate-600 text-slate-200 py-2 text-xs mt-1"
>
Resend OTP
</button>
</form>
);

const renderNewPasswordStep = () => (
<form onSubmit={handleNewPasswordSubmit} className="space-y-4">
<div>
<label className="block text-sm text-slate-200 mb-1">
New password
</label>
<input
type="password"
className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100 text-sm outline-none focus:border-indigo-500"
value={newPassword}
onChange={(e) => setNewPasswordValue(e.target.value)}
required
autoComplete="new-password"
/>
</div>
<button
type="submit"
disabled={loading}
className="w-full rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white py-2 text-sm font-medium transition"
>
{loading ? "Updating..." : "Set new password"}
</button>
</form>
);

  return (
<div className="min-h-screen flex items-center justify-center bg-slate-900">
<div className="w-full max-w-md bg-slate-800 rounded-2xl p-8 shadow-xl">
<h1 className="text-2xl font-semibold text-white mb-2 text-center">
Reset password
</h1>
<p className="text-xs text-slate-300 text-center mb-4">
Step {step === "EMAIL" ? "1" : step === "OTP" ? "2" : "3"} of 3
</p>

{error && (
<p className="text-sm text-red-400 mb-2">{error}</p>
)}

{message && (
<p className="text-sm text-emerald-400 mb-2">{message}</p>
)}

{step === "EMAIL" && renderEmailStep()}
{step === "OTP" && renderOtpStep()}
{step === "NEW_PASSWORD" && renderNewPasswordStep()}

<div className="mt-4 text-center text-xs text-slate-300">
Remembered your password?{" "}
<Link
to="/login"
className="hover:text-indigo-400 underline"
>
Back to login
</Link>
</div>
</div>
</div>
);
};

export default ForgotPasswordPage;
