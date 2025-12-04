import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import type { Channel } from "../types";
import { useAuth } from "../hooks/useAuth";

const ChannelsPage: React.FC = () => {
const [channels, setChannels] = useState<Channel[]>([]);
const [myChannels, setMyChannels] = useState<Channel[]>([]);
const [name, setName] = useState("");
const [description, setDescription] = useState("");
const [error, setError] = useState("");
const [joinError, setJoinError] = useState("");
const [loading, setLoading] = useState(true);
const navigate = useNavigate();
const { user, logout } = useAuth();
const loadChannels = async () => {
setLoading(true);
setError("");
setJoinError("");
try {
const [allRes, myRes] = await Promise.all([
api.get<Channel[]>("/channels"),
api.get<Channel[]>("/channels/me"),
]);
setChannels(allRes.data);
setMyChannels(myRes.data);
} catch (err: any) {
setError(
err?.response?.data?.detail || err?.message || "Failed to load channels"
);
} finally {
setLoading(false);
}
};

useEffect(() => {
loadChannels();
}, []);

const handleCreate = async (e: React.FormEvent) => {
e.preventDefault();
setError("");
try {
await api.post<Channel>("/channels", { name, description });
setName("");
setDescription("");
await loadChannels();
} catch (err: any) {
setError(err?.response?.data?.detail || "Failed to create channel");
}
};

const openChannel = (id: number) => {
navigate(`/channels/${id}`);
};

const isJoined = (id: number) => myChannels.some((c) => c.id === id);

const handleJoin = async (id: number) => {
setJoinError("");
try {
await api.post<Channel>(`/channels/${id}/join`);
await loadChannels();
} catch (err: any) {
setJoinError(err?.response?.data?.detail || "Failed to join channel");
}
};

const handleLeave = async (id: number) => {
setJoinError("");
try {
await api.post(`/channels/${id}/leave`);
await loadChannels();
} catch (err: any) {
setJoinError(err?.response?.data?.detail || "Failed to leave channel");
}
};
const otherChannels = channels.filter(
(c) => !myChannels.some((mc) => mc.id === c.id)
);

return (
<div style={{ padding: 24, fontFamily: "system-ui" }}>
<header style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
<h2>Channels</h2>
<div>
<span style={{ marginRight: 8 }}>{user?.name}</span>
<button onClick={logout}>Logout</button>
</div>
</header>
{error && <p style={{ color: "red" }}>{error}</p>}
{joinError && <p style={{ color: "red" }}>{joinError}</p>}
<div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
<div style={{ flex: 1, border: "1px solid #ccc", borderRadius: 8, padding: 12 }}>
<h3>My Channels</h3>
{loading && <p>Loading…</p>}
<ul style={{ listStyle: "none", padding: 0 }}>
{myChannels.map((c) => (
<li key={c.id} style={{ padding: 8, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
<span style={{ cursor: "pointer" }} onClick={() => openChannel(c.id)}>
<strong>#{c.name}</strong>
{c.description && <span> — {c.description}</span>}
</span>
<button onClick={() => handleLeave(c.id)}>Leave</button>
</li>
))}
{!loading && myChannels.length === 0 && <li>You haven&apos;t joined any channels yet.</li>}
</ul>
<h3 style={{ marginTop: 16 }}>Other Channels</h3>
<ul style={{ listStyle: "none", padding: 0 }}>
{otherChannels.map((c) => (
<li key={c.id} style={{ padding: 8, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
<span>
<strong>#{c.name}</strong>
{c.description && <span> — {c.description}</span>}
</span>
{isJoined(c.id) ? (
<button onClick={() => openChannel(c.id)}>Open</button>
) : (
<button onClick={() => handleJoin(c.id)}>Join</button>
)}
</li>
))}
{!loading && otherChannels.length === 0 && <li>No other channels.</li>}
</ul>
</div>
<form onSubmit={handleCreate} style={{ width: 300, border: "1px solid #ccc", borderRadius: 8, padding: 12 }}>
<h3>Create Channel</h3>
{error && <p style={{ color: "red" }}>{error}</p>}
<label>
Name
<input style={{ display: "block", width: "100%", marginBottom: 8 }} value={name} onChange={(e) => setName(e.target.value)} required />
</label>
<label>
Description
<input style={{ display: "block", width: "100%", marginBottom: 8 }} value={description} onChange={(e) => setDescription(e.target.value)} />
</label>
<button type="submit">Create</button>
</form>
</div>
</div>
);
}

export default ChannelsPage;
