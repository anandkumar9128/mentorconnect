import React, { useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  History,
  Settings,
  User,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../api/apiClient";
import type { Workshop } from "../types";
import LiveSessionWrapper from "../components/LiveSessionWrapper";
import type { SidebarItem } from "../components/Sidebar";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import SessionList from "../components/SessionList";
import BookingList from "../components/BookingList";
import { useBookingsData } from "../hooks/useBookingsData";
import { isSessionExpired } from "../utils/sessionUtils";
import "../styles/Dashboard.css";

const getWorkshopStatus = (w: Workshop) => {
  if (w.status === 'completed') return { disabled: true, text: 'Completed' };
  
  const [hours, minutes] = w.startTime.split(':').map(Number);
  const endDate = new Date(w.date);
  endDate.setHours(hours, minutes + w.duration, 0, 0);
  const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  
  if (isSessionExpired(w.date, endTime)) return { disabled: true, text: 'Expired' };
  
  const workshopDateTime = new Date(`${w.date.split('T')[0]}T${w.startTime}`);
  const now = new Date();
  const diffInMinutes = (workshopDateTime.getTime() - now.getTime()) / (1000 * 60);
  
  if (diffInMinutes > 10) return { disabled: true, text: 'Join 10m Early' };
  return { disabled: false, text: 'Join Meeting' };
};

const MentorDashboard: React.FC = () => {
  const { user, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const [localError, setLocalError] = useState("");
  
  const { 
    bookings, 
    myWorkshops, 
    loading, 
    error: bookingsError, 
    upcomingBookings, 
    completedBookings,
    refetchData
  } = useBookingsData('mentor', user);

  // Workshop form state
  const [workshopForm, setWorkshopForm] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    duration: 60,
    price: 0,
    capacity: 50,
  });
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [creatingWorkshop, setCreatingWorkshop] = useState(false);
  const [workshopSuccess, setWorkshopSuccess] = useState("");

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
    { id: "my_workshops", label: "My Workshops", icon: <BookOpen size={20} /> },
    { id: "edit_profile", label: "Edit Profile", icon: <User size={20} /> },
    { id: "settings", label: "Settings", icon: <Settings size={20} /> },
  ];



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
      setLocalError(err.message || "Failed to update rate");
    } finally {
      setSavingRate(false);
    }
  };



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

  const handleCreateWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingWorkshop(true);
    setLocalError("");
    setWorkshopSuccess("");
    try {
      const formData = new FormData();
      formData.append("title", workshopForm.title);
      formData.append("description", workshopForm.description);
      formData.append("date", workshopForm.date);
      formData.append("startTime", workshopForm.startTime);
      formData.append("duration", workshopForm.duration.toString());
      formData.append("price", workshopForm.price.toString());
      formData.append("capacity", workshopForm.capacity.toString());
      if (bannerFile) {
        formData.append("bannerImage", bannerFile);
      }

      await apiClient("/workshops", {
        method: "POST",
        body: formData,
      });

      await refetchData();

      setWorkshopSuccess("Workshop created successfully!");
      setWorkshopForm({ title: "", description: "", date: "", startTime: "", duration: 60, price: 0, capacity: 50 });
      setBannerFile(null);
      setTimeout(() => setWorkshopSuccess(""), 3000);
    } catch (err: any) {
      setLocalError(err.message || "Failed to create workshop");
    } finally {
      setCreatingWorkshop(false);
    }
  };

  const renderMyWorkshops = () => (
    <div className="glass-panel" style={{ padding: "2rem" }}>
      <h3 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <BookOpen size={20} className="text-primary" /> My Workshops
      </h3>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {/* Create Workshop Form */}
        <div className="glass-panel" style={{ padding: "1.5rem", background: "rgba(255,255,255,0.02)" }}>
          <h4 style={{ marginBottom: "1rem" }}>Create New Workshop</h4>
          <form onSubmit={handleCreateWorkshop} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group">
              <label>Title</label>
              <input type="text" className="form-input" required value={workshopForm.title} onChange={e => setWorkshopForm({...workshopForm, title: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="form-input" required rows={3} value={workshopForm.description} onChange={e => setWorkshopForm({...workshopForm, description: e.target.value})} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label>Date</label>
                <input type="date" className="form-input" required value={workshopForm.date} onChange={e => setWorkshopForm({...workshopForm, date: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input type="time" className="form-input" required value={workshopForm.startTime} onChange={e => setWorkshopForm({...workshopForm, startTime: e.target.value})} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label>Duration (mins)</label>
                <input type="number" className="form-input" required value={workshopForm.duration} onChange={e => setWorkshopForm({...workshopForm, duration: Number(e.target.value)})} />
              </div>
              <div className="form-group">
                <label>Price (₹)</label>
                <input type="number" className="form-input" required value={workshopForm.price} onChange={e => setWorkshopForm({...workshopForm, price: Number(e.target.value)})} />
              </div>
              <div className="form-group">
                <label>Capacity</label>
                <input type="number" className="form-input" required value={workshopForm.capacity} onChange={e => setWorkshopForm({...workshopForm, capacity: Number(e.target.value)})} />
              </div>
            </div>
            <div className="form-group">
              <label>Banner Image (Optional)</label>
              <input type="file" accept="image/*" className="form-input" onChange={e => setBannerFile(e.target.files ? e.target.files[0] : null)} />
            </div>
            {workshopSuccess && <div style={{ color: "#10b981", fontSize: "0.9rem" }}>{workshopSuccess}</div>}
            <button type="submit" className="btn-primary" disabled={creatingWorkshop}>
              {creatingWorkshop ? "Creating..." : "Publish Workshop"}
            </button>
          </form>
        </div>

        {/* List of Workshops */}
        <div>
          <h4 style={{ marginBottom: "1rem" }}>Published Workshops</h4>
          {myWorkshops.length === 0 ? (
            <p className="text-secondary">You haven't created any workshops yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {myWorkshops.map(w => (
                <div key={w._id} className="glass-panel" style={{ padding: "1rem", background: "rgba(255,255,255,0.02)" }}>
                  <h5 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>{w.title}</h5>
                  <p className="text-secondary" style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                    {new Date(w.date).toLocaleDateString()} at {w.startTime} • {w.capacity - w.enrolledCount} seats left
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span style={{ fontSize: "0.85rem", color: "#10b981", fontWeight: "bold" }}>₹{w.price}</span>
                    <button 
                      className="btn-primary" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: 'auto' }}
                      disabled={getWorkshopStatus(w).disabled}
                      onClick={() => setActiveMeeting(`workshop_${w._id}`)}
                    >
                      {getWorkshopStatus(w).text}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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
        <LiveSessionWrapper
          meetingId={activeMeeting}
          onClose={() => setActiveMeeting(null)}
        />
      ) : (
        <>
          {(localError || bookingsError) && (
            <div
              className="error-message"
              style={{
                color: "var(--error-color)",
                padding: "1rem",
                textAlign: "center",
                marginBottom: "1.5rem",
              }}
            >
              {localError || bookingsError}
            </div>
          )}

          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "upcoming_sessions" && renderUpcomingSessions()}
          {activeTab === "history" && renderSessionHistory()}
          {activeTab === "my_workshops" && renderMyWorkshops()}
          {activeTab === "edit_profile" && renderEditProfile()}
          {activeTab === "settings" && renderSettings()}
        </>
      )}
    </DashboardLayout>
  );
};

export default MentorDashboard;
