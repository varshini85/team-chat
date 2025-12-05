import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import ChannelsPage from "./pages/ChannelsPage";
import ChannelChatPage from "./pages/ChannelChatPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const App: React.FC = () => {
return (
<HashRouter>
<AuthProvider>
<Routes>

<Route path="/login" element={<LoginPage />} />
<Route path="/signup" element={<SignupPage />} />

<Route path="/channels" element={
<ProtectedRoute>
<ChannelsPage />
</ProtectedRoute>
} />

<Route path="/channels/:channelId" element={
<ProtectedRoute>
<ChannelChatPage />
</ProtectedRoute>
} />

<Route path="*" element={<Navigate to="/login" replace />} />

</Routes>
</AuthProvider>
</HashRouter>
);
};

export default App;
