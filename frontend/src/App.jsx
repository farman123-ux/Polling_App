import "./App.css";
import { Route, Routes, Navigate } from "react-router-dom";
import AuthLayout from "./components/AuthLayout.jsx";
import Layout from "./components/Layout.jsx";
import RequireAuth from "./components/RequireAuth.jsx";

// Pages
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import Dashboardpage from "./pages/Dashboardpage.jsx";
import CreatePollPage from "./pages/CreatePollPage.jsx";
import PollListPage from "./pages/PollListPage.jsx";
import SinglePollPage from "./pages/SinglePollPage.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import UserProfilePage from "./pages/UserProfilePage.jsx";
import ConnectionsPage from "./pages/ConnectionsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";

function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Private Protected App Routes */}
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboardpage />} />
          <Route path="/create-poll" element={<CreatePollPage />} />
          <Route path="/my-polls" element={<PollListPage type="mine" />} />
          <Route path="/voted-polls" element={<PollListPage type="votes" />} />
          <Route
            path="/bookmarked-polls"
            element={<PollListPage type="bookmarks" />}
          />
          <Route path="/poll/:id" element={<SinglePollPage />} />
          <Route path="/poll/:id/analytics" element={<AnalyticsPage />} />
          <Route path="/u/:username" element={<UserProfilePage />} />
          <Route
            path="/u/:username/connections"
            element={<ConnectionsPage />}
          />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
