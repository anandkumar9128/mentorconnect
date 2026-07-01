import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Calendar, History, Settings, User, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/apiClient';
import type { Booking } from '../types';
import Avatar from '../components/Avatar';
import VideoRoom from '../components/VideoRoom';
import Sidebar from '../components/Sidebar';
import type { SidebarItem } from '../components/Sidebar';
import '../styles/Dashboard.css';

const MentorDashboard: React.FC = () => {
  const { user, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Settings state
  const [hourlyRate, setHourlyRate] = useState<number>(user?.hourlyRate || 50);
  const [savingRate, setSavingRate] = useState(false);
  const [rateSuccess, setRateSuccess] = useState('');
  const [activeMeeting, setActiveMeeting] = useState<string | null>(null);

  const sidebarItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'upcoming_sessions', label: 'Upcoming Sessions', icon: <Calendar size={20} /> },
    { id: 'history', label: 'Session History', icon: <History size={20} /> },
    { id: 'edit_profile', label: 'Edit Profile', icon: <User size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await apiClient('/bookings');
        setBookings(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleUpdateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRate(true);
    setRateSuccess('');
    
    try {
      const data = await apiClient('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ hourlyRate }),
      });
      
      login({ ...data, token: user?.token });
      setRateSuccess('Rate updated successfully!');
      setTimeout(() => setRateSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update rate');
    } finally {
      setSavingRate(false);
    }
  };

  const upcomingBookings = bookings.filter(b => b.status === 'paid' || b.status === 'pending');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  
  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const renderDashboard = () => (
    <>
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '16px' }}>
        <h2>Welcome to your Mentor Dashboard, {user?.name}! 👋</h2>
        <p className="text-secondary" style={{ marginTop: '0.5rem' }}>Manage your bookings, availability, and earnings.</p>
      </div>

      <div className="stat-cards-container">
        <div className="stat-card glass-panel" style={{ borderRadius: '16px' }}>
          <div>
            <h3>Upcoming Sessions</h3>
            <div className="stat-value">{upcomingBookings.length}</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-color)' }}>
            <Calendar size={24} />
          </div>
        </div>
        
        <div className="stat-card glass-panel" style={{ borderRadius: '16px' }}>
          <div>
            <h3>Completed Sessions</h3>
            <div className="stat-value">{completedBookings.length}</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <History size={24} />
          </div>
        </div>
        
        <div className="stat-card glass-panel" style={{ borderRadius: '16px' }}>
          <div>
            <h3>Total Earnings</h3>
            <div className="stat-value">₹{totalEarnings}</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <span style={{ fontWeight: 'bold' }}>₹</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Recent Session Requests</h3>
          {bookings.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bookings.slice(0, 3).map(booking => (
                <div key={booking._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Avatar size={40} src={(booking.student as any)?.profilePhoto} alt={(booking.student as any)?.name} />
                    <div>
                      <div style={{ fontWeight: 500 }}>{(booking.student as any)?.name}</div>
                      <div className="text-secondary" style={{ fontSize: '0.85rem' }}>
                        {new Date(booking.date).toLocaleDateString()} at {booking.startTime}
                      </div>
                    </div>
                  </div>
                  <span style={{ 
                        display: 'inline-block', 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '30px', 
                        fontSize: '0.8rem',
                        background: booking.status === 'paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: booking.status === 'paid' ? '#10b981' : '#f59e0b',
                        textTransform: 'uppercase',
                        fontWeight: 'bold'
                      }}>
                        {booking.status === 'paid' ? 'Confirmed' : booking.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary">No recent requests found.</p>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button className="btn" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-color)' }} onClick={() => setActiveTab('upcoming_sessions')}>View Upcoming Sessions</button>
            <button className="btn" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }} onClick={() => setActiveTab('edit_profile')}>Edit Profile</button>
            <button className="btn" style={{ background: 'rgba(255, 255, 255, 0.05)' }} onClick={() => setActiveTab('settings')}>View Settings</button>
          </div>
        </div>
      </div>
    </>
  );

  const renderUpcomingSessions = () => (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem' }}>Upcoming Session Requests</h3>
      
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading bookings...</p>
        </div>
      ) : upcomingBookings.length === 0 ? (
        <div className="empty-state">
          <h3>No bookings yet</h3>
          <p className="text-secondary">When students request a session, it will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {upcomingBookings.map((booking) => (
            <div key={booking._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Avatar src={(booking.student as any)?.profilePhoto} alt={(booking.student as any)?.name} size={50} />
                
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{(booking.student as any)?.name}</h4>
                  <p className="text-secondary" style={{ fontSize: '0.9rem' }}>{(booking.student as any)?.email}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <Calendar size={18} className="text-primary" />
                  <span>{new Date(booking.date).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <Clock size={18} className="text-primary" />
                  <span>{booking.startTime} - {booking.endTime}</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>₹{booking.totalPrice}</div>
                {booking.status === 'paid' && (
                  <button 
                    className="btn btn-primary" 
                    style={{ marginTop: '0.5rem', display: 'block', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                    onClick={() => setActiveMeeting(booking.meetingId || `call_${booking._id}`)}
                  >
                    Join Meeting
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSessionHistory = () => (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem' }}>Session History</h3>
      {completedBookings.length === 0 ? (
        <p className="text-secondary">No past sessions found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Implement past sessions similarly if needed */}
        </div>
      )}
    </div>
  );

  const renderEditProfile = () => (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <User size={20} className="text-primary" /> Edit Profile
      </h3>
      <p className="text-secondary">You can update your profile details here. (Form implementation goes here)</p>
    </div>
  );

  const renderSettings = () => (
    <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content', maxWidth: '500px' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
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
        {rateSuccess && <div style={{ color: '#10b981', fontSize: '0.9rem', marginTop: '0.5rem' }}>{rateSuccess}</div>}
        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.5rem' }} disabled={savingRate}>
          {savingRate ? 'Saving...' : 'Update Rate'}
        </button>
      </form>
    </div>
  );

  return (
    <div className="dashboard-layout">
      <Sidebar items={sidebarItems} activeTab={activeTab} onTabChange={setActiveTab} user={user} onLogout={logout} />
      
      <main className="dashboard-main">
        {activeMeeting ? (
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Live Session</h3>
              <button className="btn" onClick={() => setActiveMeeting(null)}>Close Video Room</button>
            </div>
            <VideoRoom meetingId={activeMeeting} onLeave={() => setActiveMeeting(null)} />
          </div>
        ) : (
          <>
            {error && <div className="error-message" style={{ color: 'var(--error-color)', padding: '1rem', textAlign: 'center', marginBottom: '1.5rem' }}>{error}</div>}

            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'upcoming_sessions' && renderUpcomingSessions()}
            {activeTab === 'history' && renderSessionHistory()}
            {activeTab === 'edit_profile' && renderEditProfile()}
            {activeTab === 'settings' && renderSettings()}
          </>
        )}
      </main>
    </div>
  );
};

export default MentorDashboard;
