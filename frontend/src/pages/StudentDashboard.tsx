import React, { useState, useEffect } from 'react';
import { Search, Briefcase, GraduationCap, DollarSign, LayoutDashboard, Calendar, History, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/apiClient';
import { useDebounce } from '../hooks/useDebounce';
import type { Mentor, Booking } from '../types';
import Avatar from '../components/Avatar';
import BookingModal from '../components/BookingModal';
import VideoRoom from '../components/VideoRoom';
import Sidebar from '../components/Sidebar';
import type { SidebarItem } from '../components/Sidebar';
import '../styles/Dashboard.css';

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeMeeting, setActiveMeeting] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const sidebarItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'find_mentors', label: 'Find Mentors', icon: <Search size={20} /> },
    { id: 'upcoming_sessions', label: 'Upcoming Sessions', icon: <Calendar size={20} /> },
    { id: 'history', label: 'Session History', icon: <History size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true);
      setError('');
      try {
        const query = debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : '';
        const [mentorsData, bookingsData] = await Promise.all([
          apiClient(`/users/mentors${query}`),
          apiClient('/bookings')
        ]);
        setMentors(mentorsData);
        setBookings(bookingsData);
      } catch (err: any) {
        setError(err.message || 'Failed to load mentors');
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, [debouncedSearch]);

  const handleBookingSuccess = async () => {
    setSuccessMessage('Booking and payment successful!');
    
    try {
      const bookingsData = await apiClient('/bookings');
      setBookings(bookingsData);
      setActiveTab('upcoming_sessions'); // Switch to upcoming sessions to show new booking
    } catch (err) {
      console.error('Failed to refresh bookings', err);
    }

    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const upcomingBookings = bookings.filter(b => b.status === 'paid' || b.status === 'pending');
  const completedBookings = bookings.filter(b => b.status === 'completed');

  const renderDashboard = () => (
    <>
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '16px' }}>
        <h2>Welcome back, {user?.name}! 👋</h2>
        <p className="text-secondary" style={{ marginTop: '0.5rem' }}>This is your Student dashboard. From here you can manage your activities and settings.</p>
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
            <h3>Total Sessions</h3>
            <div className="stat-value">{bookings.length}</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <LayoutDashboard size={24} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Recent Sessions</h3>
          {bookings.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bookings.slice(0, 3).map(booking => (
                <div key={booking._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Avatar size={40} src={(booking.mentor as any)?.profilePhoto} alt={(booking.mentor as any)?.name} />
                    <div>
                      <div style={{ fontWeight: 500 }}>{(booking.mentor as any)?.name}</div>
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
            <p className="text-secondary">No recent sessions found.</p>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button className="btn" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-color)' }} onClick={() => setActiveTab('find_mentors')}>Find Mentors</button>
            <button className="btn" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }} onClick={() => setActiveTab('upcoming_sessions')}>View Upcoming Sessions</button>
            <button className="btn" style={{ background: 'rgba(255, 255, 255, 0.05)' }} onClick={() => setActiveTab('settings')}>View Settings</button>
          </div>
        </div>
      </div>
    </>
  );

  const renderFindMentors = () => (
    <>
      <div className="dashboard-header glass-panel" style={{ padding: '1.5rem' }}>
        <div>
          <h2>Find Mentors</h2>
          <p className="text-secondary">Search by name or specialization</p>
        </div>
        <div className="search-bar" style={{ margin: 0 }}>
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="E.g. Backend Developer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading mentors...</p>
        </div>
      ) : mentors.length === 0 ? (
        <div className="empty-state glass-panel">
          <h3>No mentors found</h3>
          <p className="text-secondary">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="mentors-grid">
          {mentors.map((mentor) => (
            <div key={mentor._id} className="mentor-card glass-panel">
              <div className="mentor-header">
                <Avatar src={mentor.profilePhoto} alt={mentor.name} size={64} className="mentor-avatar" />
                <div>
                  <h3 className="mentor-name">{mentor.name}</h3>
                  <p className="mentor-specialization text-gradient">{mentor.specialization}</p>
                </div>
              </div>

              <div className="mentor-details">
                <div className="detail-item">
                  <Briefcase size={16} className="detail-icon" />
                  <span>{mentor.field} • {mentor.experience}</span>
                </div>
                <div className="detail-item">
                  <GraduationCap size={16} className="detail-icon" />
                  <span>{mentor.education}</span>
                </div>
              </div>

              <div className="mentor-footer">
                <div className="mentor-price">
                  <DollarSign size={18} />
                  <span>{mentor.hourlyRate || 50}<span className="price-suffix">/hr</span></span>
                </div>
                <button 
                  className="btn-primary" 
                  onClick={() => setSelectedMentor(mentor)}
                >
                  Book Session
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  const renderUpcomingSessions = () => (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem' }}>Upcoming Sessions</h3>
      {upcomingBookings.length === 0 ? (
        <p className="text-secondary">You have no upcoming sessions.</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {upcomingBookings.map((booking) => (
            <div key={booking._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <Avatar size={50} alt={(booking.mentor as any)?.name || 'Mentor'} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Session with {(booking.mentor as any)?.name}</h4>
                  <p style={{ margin: 0, marginTop: '0.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {new Date(booking.date).toLocaleDateString()} at {booking.startTime}
                  </p>
                </div>
              </div>
              <div>
                {booking.status === 'paid' ? (
                  <button className="btn btn-primary" onClick={() => setActiveMeeting(booking.meetingId || `call_${booking._id}`)}>
                    Join Meeting
                  </button>
                ) : (
                  <span style={{ 
                    display: 'inline-block', 
                    padding: '0.4rem 1rem', 
                    borderRadius: '30px', 
                    fontSize: '0.85rem',
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: '#f59e0b',
                    textTransform: 'uppercase',
                    fontWeight: 'bold'
                  }}>
                    {booking.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h3>Settings</h3>
      <p className="text-secondary" style={{ marginTop: '1rem' }}>Your profile settings will appear here.</p>
    </div>
  );

  return (
    <div className="dashboard-layout">
      <Sidebar items={sidebarItems} activeTab={activeTab} onTabChange={setActiveTab} user={user} onLogout={logout} />
      
      <main className="dashboard-main">
        {activeMeeting ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Live Session</h2>
              <button className="btn" onClick={() => setActiveMeeting(null)}>Close Video Room</button>
            </div>
            <VideoRoom meetingId={activeMeeting} onLeave={() => setActiveMeeting(null)} />
          </div>
        ) : (
          <>
            {successMessage && (
              <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px', marginBottom: '1.5rem' }}>
                {successMessage}
              </div>
            )}
            
            {error && <div className="error-message" style={{ color: 'var(--error-color)', padding: '1rem', textAlign: 'center', marginBottom: '1.5rem' }}>{error}</div>}

            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'find_mentors' && renderFindMentors()}
            {activeTab === 'upcoming_sessions' && renderUpcomingSessions()}
            {activeTab === 'history' && renderUpcomingSessions()}
            {activeTab === 'settings' && renderSettings()}
            
            {selectedMentor && (
              <BookingModal 
                mentor={selectedMentor} 
                isOpen={true} 
                onClose={() => setSelectedMentor(null)} 
                onSuccess={handleBookingSuccess} 
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
