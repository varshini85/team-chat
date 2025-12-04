import React, { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";
import type { Channel, Message } from "../types";
import { useAuth } from "../hooks/useAuth";

const PAGE_SIZE = 20;

const ChannelChatPage: React.FC = () => {
const { channelId } = useParams<{ channelId: string }>();
const cid = Number(channelId);
const { user } = useAuth();
const [channel, setChannel] = useState<Channel | null>(null);
const [messages, setMessages] = useState<Message[]>([]);
const [input, setInput] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(true);
const [isMember, setIsMember] = useState<boolean>(true);
const [onlineUserIds, setOnlineUserIds] = useState<number[]>([]);
const [memberCount, setMemberCount] = useState<number>(0);
const [offset, setOffset] = useState(0);
const [hasMore, setHasMore] = useState(true);
const [loadingMore, setLoadingMore] = useState(false);
const [editingId, setEditingId] = useState<number | null>(null);
const [editingText, setEditingText] = useState("");
const endRef = useRef<HTMLDivElement | null>(null);
const wsRef = useRef<WebSocket | null>(null);
const scrollToBottom = () => {
endRef.current?.scrollIntoView({ behavior: "smooth" });
};

useEffect(() => {
if (Number.isNaN(cid)) {
setError("Invalid channel id");
setLoading(false);
return;
}

setError("");
setLoading(true);

const load = async () => {
try {
const [channelsRes, messagesRes, myChannelsRes, membersRes] =
await Promise.all([
api.get<Channel[]>("/channels"),
api.get<Message[]>(`/messages/${cid}`, {
params: { limit: PAGE_SIZE, offset: 0 },
}),
api.get<Channel[]>("/channels/me"),
api.get<any[]>(`/channels/${cid}/members`),
]);

const ch = channelsRes.data.find((c) => c.id === cid) || null;
setChannel(ch);

const initialBatch = [...messagesRes.data].reverse();
setMessages(initialBatch);
setOffset(messagesRes.data.length);

if (messagesRes.data.length < PAGE_SIZE) {
setHasMore(false);
}

const member = myChannelsRes.data.some((c) => c.id === cid);
setIsMember(member);
setMemberCount(membersRes.data.length);
} catch (err: any) {
console.error("Failed to load chat data", err);
setError(
err?.response?.data?.detail ||
err?.message ||
"Failed to load channel/messages"
);
} finally {
setLoading(false);
setTimeout(scrollToBottom, 50);
}
};

load();
}, [cid]);

const handleLoadOlder = async () => {
if (!hasMore || loadingMore || Number.isNaN(cid)) return;

setLoadingMore(true);
setError("");

try {
const res = await api.get<Message[]>(`/messages/${cid}`, {
params: { limit: PAGE_SIZE, offset },
});

const batch = res.data;
if (batch.length === 0) {
setHasMore(false);
return;
}
if (batch.length < PAGE_SIZE) {
setHasMore(false);
}

const older = [...batch].reverse();
setMessages((prev) => [...older, ...prev]);
setOffset((prev) => prev + batch.length);
} catch (err: any) {
console.error("Failed to load older messages", err);
setError(
err?.response?.data?.detail ||
err?.message ||
"Failed to load older messages"
);
} finally {
setLoadingMore(false);
}
};

useEffect(() => {
if (Number.isNaN(cid)) return;

const token = localStorage.getItem("access_token");
if (!token) return;

const protocol = window.location.protocol === "https:" ? "wss" : "ws";
const wsUrl = `${protocol}://ws/channels/${cid}?token=${encodeURIComponent(
token
)}`;

const socket = new WebSocket(wsUrl);
wsRef.current = socket;

socket.onmessage = (event) => {
try {
const data = JSON.parse(event.data);

if (data.type === "presence") {
setOnlineUserIds(data.online_user_ids || []);
} else if (data.type === "message") {

if (user && data.user_id === user.id) {
return;
}

const incoming: any = {
id: Date.now(),
text: data.text,
created_at: new Date().toISOString(),
sender: {
id: data.user_id,
name: data.user_name,
email: "",
},
};

setMessages((prev) => [...prev, incoming as Message]);
scrollToBottom();
}
} catch (e) {
console.error("WS message parse error", e);
}
};

socket.onerror = (e) => {
console.error("WebSocket error", e);
};

socket.onclose = () => {
wsRef.current = null;
};

return () => {
socket.close();
wsRef.current = null;
};
}, [cid, user?.id]);

useEffect(() => {
if (Number.isNaN(cid)) return;

const refreshLatest = async () => {
try {
const res = await api.get<Message[]>(`/messages/${cid}`, {
params: { limit: PAGE_SIZE, offset: 0 },
});

const latestBatch = [...res.data].reverse(); // oldest → newest

setMessages((prev) => {
if (prev.length === 0) {
return latestBatch;
}

const existingIds = new Set(prev.map((m) => m.id));
const merged = [...prev];

for (const msg of latestBatch) {
if (!existingIds.has(msg.id)) {
merged.push(msg);
}
}

return merged;
});
} catch (err) {
console.error("Failed to refresh messages", err);
}
};

const intervalId = window.setInterval(refreshLatest, 2000);

return () => {
window.clearInterval(intervalId);
};
}, [cid]);

const handleSend = async (e: FormEvent<HTMLFormElement>) => {
e.preventDefault();
if (!input.trim() || Number.isNaN(cid) || !isMember) return;

const text = input.trim();
setInput("");
setError("");

try {
const res = await api.post<Message>(`/messages/${cid}`, { text });

setMessages((prev) => [...prev, res.data]);
scrollToBottom();
} catch (err: any) {
console.error("Failed to send message", err);
if (err?.response?.status === 403) {
setIsMember(false);
}
setError(
err?.response?.data?.detail ||
err?.message ||
"Failed to send message"
);
}

if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
wsRef.current.send(text);
}
};

const handleDeleteMessage = async (id: number) => {
if (!window.confirm("Delete this message?")) return;

try {
await api.delete(`/messages/${id}`);
setMessages((prev) => prev.filter((m) => m.id !== id));
} catch (err: any) {
console.error("Failed to delete message", err);
setError(
err?.response?.data?.detail ||
err?.message ||
"Failed to delete message"
);
}
};

const handleEditMessage = async (id: number) => {
if (!editingText.trim()) return;

try {
const res = await api.patch<Message>(`/messages/${id}`, {
text: editingText,
});

setMessages((prev) =>
prev.map((m) => (m.id === id ? res.data : m))
);

setEditingId(null);
setEditingText("");
} catch (err: any) {
console.error("Failed to edit message", err);
setError(
err?.response?.data?.detail ||
err?.message ||
"Failed to edit message"
);
}
};

const handleJoinChannel = async () => {
if (Number.isNaN(cid)) return;
setError("");

try {
await api.post<Channel>(`/channels/${cid}/join`);
setIsMember(true);

const membersRes = await api.get<any[]>(`/channels/${cid}/members`);
setMemberCount(membersRes.data.length);
} catch (err: any) {
console.error("Failed to join channel", err);
setError(
err?.response?.data?.detail ||
err?.message ||
"Failed to join channel"
);
}
};

if (Number.isNaN(cid)) {
return (
<div style={{ padding: 24, fontFamily: "system-ui" }}>
<Link to="/channels">← Back</Link>
<p>Invalid channel id.</p>
</div>
);
}

const onlineCount = onlineUserIds.length;

return (
<div style={{ padding: 24, fontFamily: "system-ui" }}>
<header
style={{
display: "flex",
justifyContent: "space-between",
marginBottom: 8,
}}
>
<div>
<Link to="/channels">← Back</Link>
<span style={{ marginLeft: 8 }}>
#{channel?.name ?? `Channel ${cid}`}
</span>
</div>
<div style={{ fontSize: 12, color: "#e41919ff", textAlign: "right" }}>
<div>Members: {memberCount}</div>
{onlineCount > 0 && <div>{onlineCount} online</div>}
</div>
</header>

{!isMember && (
<div
style={{
marginBottom: 8,
padding: 8,
borderRadius: 6,
background: "#fdca00ff",
border: "1px solid #ffcc00ff",
}}
>
<p style={{ margin: 0, marginBottom: 4 }}>
You are not a member of this channel.
</p>
<button onClick={handleJoinChannel}>Join channel</button>
</div>
)}

<div
style={{
display: "flex",
flexDirection: "column",
height: "calc(100vh - 180px)",
border: "1px solid #ccc",
borderRadius: 8,
padding: 8,
}}
>
<div
style={{
flex: 1,
overflowY: "auto",
paddingRight: 4,
marginBottom: 8,
}}
>
{loading && <p>Loading chat…</p>}
{error && !loading && <p style={{ color: "red" }}>Error: {error}</p>}

{!loading && hasMore && (
<button
onClick={handleLoadOlder}
disabled={loadingMore}
style={{
marginBottom: 8,
padding: "4px 8px",
fontSize: 12,
cursor: loadingMore ? "default" : "pointer",
}}
>
{loadingMore ? "Loading…" : "Load older messages"}
</button>
)}

{!loading &&
messages.map((m) => {
const isMine = user && (m as any).sender?.id === user.id;
const senderName = (m as any).sender?.name ?? "Unknown";

let timeLabel = "";
try {
timeLabel = new Date(m.created_at).toLocaleTimeString([], {
hour: "2-digit",
minute: "2-digit",
});
} catch {
timeLabel = "";
}

return (
<div key={m.id} style={{ marginBottom: 8 }}>
<div
style={{
display: "flex",
justifyContent: "space-between",
fontSize: 11,
color: "#555",
}}
>
<div>
<strong>{senderName}</strong> {timeLabel}
</div>

{isMine && (
<div style={{ display: "flex", gap: 6 }}>
<button
type="button"
onClick={() => {
setEditingId(m.id);
setEditingText(m.text);
}}
style={{
border: "none",
background: "transparent",
color: "#DC2626",
fontSize: 10,
cursor: "pointer",
}}
>
edit
</button>

<button
type="button"
onClick={() => handleDeleteMessage(m.id)}
style={{
border: "none",
background: "transparent",
color: "#DC2626",
fontSize: 10,
cursor: "pointer",
}}
>
delete
</button>
</div>
)}
</div>

{editingId === m.id ? (
<div style={{ display: "flex", gap: 6, marginTop: 4 }}>
<input
value={editingText}
onChange={(e) => setEditingText(e.target.value)}
style={{ flex: 1, padding: 6 }}
/>
<button
type="button"
onClick={() => handleEditMessage(m.id)}
>
Save
</button>
<button
type="button"
onClick={() => {
setEditingId(null);
setEditingText("");
}}
>
Cancel
</button>
</div>
) : (
<div
style={{
display: "inline-block",
padding: "6px 10px",
borderRadius: 12,
background: "#2809d7ff",
marginTop: 2,
}}
>
{m.text}
</div>
)}
</div>
);
})}

<div ref={endRef} />
</div>

<form onSubmit={handleSend} style={{ display: "flex", gap: 8 }}>
<input
style={{ flex: 1, padding: 8 }}
value={input}
onChange={(e) => setInput(e.target.value)}
placeholder={
isMember
? "Type a message..."
: "Join the channel to send messages"
}
disabled={!isMember}
/>
<button type="submit" disabled={!isMember}>
Send
</button>
</form>
</div>
</div>
);
};

export default ChannelChatPage;
