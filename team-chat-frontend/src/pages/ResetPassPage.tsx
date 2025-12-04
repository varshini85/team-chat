import React, { useState } from "react";
import type { FormEvent } from "react";
import { resetPassword } from "../api/auth";

const ResetPasswordPage: React.FC = () => {
const [oldPassword, setOldPassword] = useState("");
const [newPassword, setNewPassword] = useState("");

const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [message, setMessage] = useState<string | null>(null);

const handleSubmit = async (e: FormEvent) => {
e.preventDefault();
setLoading(true);
setError(null);
setMessage(null);

try {
const token = localStorage.getItem("access_token");
if (!token) {
setError("You must be logged in to change password.");
setLoading(false);
return;
}

const data = await resetPassword(
{
old_password: oldPassword,
new_password: newPassword,
},
token
);
setMessage(data.message || "Password updated successfully");
setOldPassword("");
setNewPassword("");
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

  return (
<div className="min-h-screen flex items-center justify-center bg-slate-900">
<div className="w-full max-w-md bg-slate-800 rounded-2xl p-8 shadow-xl">
<h1 className="text-2xl font-semibold text-white mb-6 text-center">
Change password
</h1>

{error && (
<p className="text-sm text-red-400 mb-2">{error}</p>
)}

{message && (
<p className="text-sm text-emerald-400 mb-2">{message}</p>
)}

<form onSubmit={handleSubmit} className="space-y-4">
<div>
<label className="block text-sm text-slate-200 mb-1">
Old password
</label>
<input
type="password"
className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100 text-sm outline-none focus:border-indigo-500"
value={oldPassword}
onChange={(e) => setOldPassword(e.target.value)}
required
/>
</div>

<div>
<label className="block text-sm text-slate-200 mb-1">
New password
</label>
<input
type="password"
className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100 text-sm outline-none focus:border-indigo-500"
value={newPassword}
onChange={(e) => setNewPassword(e.target.value)}
required
/>
</div>

<button
type="submit"
disabled={loading}
className="w-full rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white py-2 text-sm font-medium transition"
>
{loading ? "Updating..." : "Update password"}
</button>
</form>
</div>
</div>
);
};

export default ResetPasswordPage;
