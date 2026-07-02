import React, { useState, useEffect } from 'react';
import { Search, Briefcase, GraduationCap, LayoutDashboard, Calendar, History, Settings, IndianRupee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/apiClient';
import { useDebounce } from '../hooks/useDebounce';
import type { Mentor, Booking } from '../types';
import Avatar from '../components/Avatar';
import BookingModal from '../components/BookingModal';
import LiveSessionWrapper from '../components/LiveSessionWrapper';
import type { SidebarItem } from '../components/Sidebar';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import SessionList from '../components/SessionList';
import BookingList from '../components/BookingList';
import { isSessionExpired } from '../utils/sessionUtils';
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

  const upcomingBookings = bookings.filter(b => (b.status === 'paid' || b.status === 'pending') && !isSessionExpired(b.date, b.endTime));
  const completedBookings = bookings.filter(b => b.status === 'completed' || ((b.status === 'paid' || b.status === 'pending') && isSessionExpired(b.date, b.endTime)));

  const renderDashboard = () => (
    <>
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '16px' }}>
        <h2>Welcome back, {user?.name}! 👋</h2>
        <p className="text-secondary" style={{ marginTop: '0.5rem' }}>This is your Student dashboard. From here you can manage your activities and settings.</p>
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
          title="Total Sessions" 
          value={bookings.length} 
          icon={<LayoutDashboard size={24} />} 
          iconBgColor="rgba(59, 130, 246, 0.1)" 
          iconColor="#3b82f6" 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <SessionList 
          title="Recent Sessions" 
          bookings={bookings.slice(0, 3)} 
          emptyMessage="No recent sessions found." 
          role="student" 
        />
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
                  <IndianRupee size={18} />
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
    <BookingList 
      title="Upcoming Sessions"
      bookings={upcomingBookings}
      emptyTitle="No upcoming sessions"
      emptySubtitle="You have no upcoming sessions."
      role="student"
      onJoinMeeting={setActiveMeeting}
    />
  );

  const renderSessionHistory = () => (
    <BookingList 
      title="Session History"
      bookings={completedBookings}
      emptyTitle="No past sessions"
      emptySubtitle="No past sessions found."
      role="student"
      onJoinMeeting={setActiveMeeting}
    />
  );

  const renderSettings = () => (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h3>Settings</h3>
      <p className="text-secondary" style={{ marginTop: '1rem' }}>Your profile settings will appear here.</p>
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
          {successMessage && (
            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px', marginBottom: '1.5rem' }}>
              {successMessage}
            </div>
          )}
          
          {error && <div className="error-message" style={{ color: 'var(--error-color)', padding: '1rem', textAlign: 'center', marginBottom: '1.5rem' }}>{error}</div>}

          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'find_mentors' && renderFindMentors()}
          {activeTab === 'upcoming_sessions' && renderUpcomingSessions()}
          {activeTab === 'history' && renderSessionHistory()}
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
    </DashboardLayout>
  );
};

export default StudentDashboard;
