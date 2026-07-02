import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Calendar,
  History,
  Settings,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../api/apiClient";
import type { Booking } from "../types";
import LiveSessionWrapper from "../components/LiveSessionWrapper";
import type { SidebarItem } from "../components/Sidebar";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import SessionList from "../components/SessionList";
import BookingList from "../components/BookingList";
import { isSessionExpired } from "../utils/sessionUtils";
import "../styles/Dashboard.css";

const MentorDashboard: React.FC = () => {
  const { user, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Settings state
  const [hourlyRate, setHourlyRate] = useState<number>(user?.hourlyRate || 50);
  const [savingRate, setSavingRate] = useState(false);
  const [rateSuccess, setRateSuccess] = useState("");
  const [activeMeeting, setActiveMeeting] = useState<string | null>(null);

  const sidebarItems: SidebarItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      id: "upcoming_sessions",
      label: "Upcoming Sessions",
      icon: <Calendar size={20} />,
    },
    { id: "history", label: "Session History", icon: <History size={20} /> },
    { id: "edit_profile", label: "Edit Profile", icon: <User size={20} /> },
    { id: "settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await apiClient("/bookings");
        setBookings(data);
      } catch (err: any) {
        setError(err.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleUpdateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRate(true);
    setRateSuccess("");

    try {
      const data = await apiClient("/users/profile", {
        method: "PUT",
        body: JSON.stringify({ hourlyRate }),
      });

      login({ ...data, token: user?.token });
      setRateSuccess("Rate updated successfully!");
      setTimeout(() => setRateSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update rate");
    } finally {
      setSavingRate(false);
    }
  };

  const upcomingBookings = bookings.filter(
    (b) =>
      (b.status === "paid" || b.status === "pending") &&
      !isSessionExpired(b.date, b.endTime),
  );
  const completedBookings = bookings.filter(
    (b) =>
      b.status === "completed" ||
      ((b.status === "paid" || b.status === "pending") &&
        isSessionExpired(b.date, b.endTime)),
  );

  const totalEarnings = completedBookings.reduce(
    (sum, b) => sum + (b.totalPrice || 0),
    0,
  );

  const renderDashboard = () => (
    <>
      <div
        className="glass-panel"
        style={{ padding: "2rem", marginBottom: "2rem", borderRadius: "16px" }}
      >
        <h2>Welcome to your Mentor Dashboard, {user?.name}! 👋</h2>
        <p className="text-secondary" style={{ marginTop: "0.5rem" }}>
          Manage your bookings, availability, and earnings.
        </p>
      </div>

      <div className="stat-cards-container">
        <StatCard
          title="Upcoming Sessions"
          value={upcomingBookings.length}
          icon={<Calendar size={24} />}
          iconBgColor="rgba(99, 102, 241, 0.1)"
          iconColor="var(--primary-color)"
        />
        <StatCard
          title="Completed Sessions"
          value={completedBookings.length}
          icon={<History size={24} />}
          iconBgColor="rgba(16, 185, 129, 0.1)"
          iconColor="#10b981"
        />
        <StatCard
          title="Total Earnings"
          value={`₹${totalEarnings}`}
          icon={<span style={{ fontWeight: "bold" }}>₹</span>}
          iconBgColor="rgba(245, 158, 11, 0.1)"
          iconColor="#f59e0b"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "1.5rem",
        }}
      >
        <SessionList
          title="Recent Session Requests"
          bookings={bookings.slice(0, 3)}
          emptyMessage="No recent requests found."
          role="mentor"
        />
      </div>
    </>
  );

  const renderUpcomingSessions = () => (
    <BookingList 
      title="Upcoming Session Requests"
      bookings={upcomingBookings}
      emptyTitle="No bookings yet"
      emptySubtitle="When students request a session, it will appear here."
      role="mentor"
      loading={loading}
      onJoinMeeting={setActiveMeeting}
    />
  );

  const renderSessionHistory = () => (
    <BookingList 
      title="Session History"
      bookings={completedBookings}
      emptyTitle="No past sessions"
      emptySubtitle="No past sessions found."
      role="mentor"
      loading={loading}
      onJoinMeeting={setActiveMeeting}
    />
  );

  const renderEditProfile = () => (
    <div className="glass-panel" style={{ padding: "2rem" }}>
      <h3
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <User size={20} className="text-primary" /> Edit Profile
      </h3>
      <p className="text-secondary">
        You can update your profile details here. (Form implementation goes
        here)
      </p>
    </div>
  );

  const renderSettings = () => (
    <div
      className="glass-panel"
      style={{ padding: "2rem", height: "fit-content", maxWidth: "500px" }}
    >
      <h3
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <Settings size={20} className="text-primary" /> Settings
      </h3>

      <form onSubmit={handleUpdateRate}>
        <div className="form-group">
          <label>Hourly Rate (₹/hr)</label>
          <input
            type="number"
            className="form-input"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Number(e.target.value))}
            min="1"
            required
          />
        </div>
        {rateSuccess && (
          <div
            style={{
              color: "#10b981",
              fontSize: "0.9rem",
              marginTop: "0.5rem",
            }}
          >
            {rateSuccess}
          </div>
        )}
        <button
          type="submit"
          className="btn-primary"
          style={{ width: "100%", marginTop: "1rem", padding: "0.5rem" }}
          disabled={savingRate}
        >
          {savingRate ? "Saving..." : "Update Rate"}
        </button>
      </form>
    </div>
  );

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      user={user}
      onLogout={logout}
    >
      {activeMeeting ? (
        <LiveSessionWrapper meetingId={activeMeeting} onClose={() => setActiveMeeting(null)} />
      ) : (
        <>
          {error && (
            <div
              className="error-message"
              style={{
                color: "var(--error-color)",
                padding: "1rem",
                textAlign: "center",
                marginBottom: "1.5rem",
              }}
            >
              {error}
            </div>
          )}

          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "upcoming_sessions" && renderUpcomingSessions()}
          {activeTab === "history" && renderSessionHistory()}
          {activeTab === "edit_profile" && renderEditProfile()}
          {activeTab === "settings" && renderSettings()}
        </>
      )}
    </DashboardLayout>
  );
};

export default MentorDashboard;
