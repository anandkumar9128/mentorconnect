import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, Users, IndianRupee } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import type { Workshop } from '../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import '../styles/Dashboard.css';

const Workshops: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const data = await apiClient('/workshops');
        setWorkshops(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load workshops');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  const handleEnroll = async (workshopId: string) => {
    try {
      setEnrollingId(workshopId);
      setError('');
      setSuccess('');
      
      await apiClient(`/workshops/${workshopId}/enroll`, {
        method: 'POST'
      });

      setSuccess('Successfully enrolled! You can find this workshop in your Dashboard.');
      
      // Update local state to reflect capacity change and enrolled student
      setWorkshops(prev => prev.map(w => 
        w._id === workshopId 
          ? { 
              ...w, 
              enrolledCount: w.enrolledCount + 1, 
              enrolledStudents: w.enrolledStudents ? [...w.enrolledStudents, user?._id || ''] : [user?._id || ''] 
            }
          : w
      ));

      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to enroll');
      setTimeout(() => setError(''), 4000);
    } finally {
      setEnrollingId(null);
    }
  };

  const filteredWorkshops = workshops.filter(w => 
    w.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.mentor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="dashboard-header glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Upcoming Workshops</h1>
          <p className="text-secondary">Learn from industry experts in interactive group sessions.</p>
        </div>
        <div className="search-bar" style={{ margin: 0, minWidth: '300px' }}>
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search by topic or mentor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ color: 'var(--error-color)', padding: '1rem', textAlign: 'center', marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message" style={{ color: '#10b981', padding: '1rem', textAlign: 'center', marginBottom: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
          {success}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading workshops...</p>
        </div>
      ) : filteredWorkshops.length === 0 ? (
        <div className="empty-state glass-panel">
          <h3>No workshops found</h3>
          <p className="text-secondary">Try adjusting your search criteria or check back later.</p>
        </div>
      ) : (
        <div className="mentors-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
          {filteredWorkshops.map((workshop) => (
            <div key={workshop._id} className="mentor-card glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              
              {workshop.bannerImage ? (
                <div style={{ width: '100%', height: '160px', borderRadius: '12px 12px 0 0', overflow: 'hidden', marginBottom: '1rem' }}>
                  <img src={workshop.bannerImage} alt={workshop.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{ width: '100%', height: '160px', borderRadius: '12px 12px 0 0', background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <h3 style={{ color: 'white', textAlign: 'center', padding: '1rem' }}>{workshop.title}</h3>
                </div>
              )}

              <div style={{ padding: '0 1.5rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', lineHeight: 1.4 }}>{workshop.title}</h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <Avatar src={workshop.mentor.profilePhoto} alt={workshop.mentor.name} size={32} />
                  <span className="text-secondary" style={{ fontSize: '0.95rem' }}>by <strong>{workshop.mentor.name}</strong></span>
                </div>

                <div className="mentor-details" style={{ marginTop: 'auto', marginBottom: '1.5rem' }}>
                  <div className="detail-item">
                    <Calendar size={16} className="detail-icon" />
                    <span>{new Date(workshop.date).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <Clock size={16} className="detail-icon" />
                    <span>{workshop.startTime} ({workshop.duration} mins)</span>
                  </div>
                  <div className="detail-item">
                    <Users size={16} className="detail-icon" />
                    <span>{workshop.capacity - workshop.enrolledCount} seats left</span>
                  </div>
                </div>

                <div className="mentor-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.25rem', marginTop: 0 }}>
                  <div className="mentor-price">
                    <IndianRupee size={18} />
                    <span style={{ fontSize: '1.25rem' }}>{workshop.price}</span>
                  </div>
                  <button 
                    className="btn-primary" 
                    onClick={() => {
                      const isCreator = user && workshop.mentor._id === user._id;
                      if (isCreator) {
                        navigate('/dashboard', { state: { tab: 'my_workshops' } });
                      } else if (user && workshop.enrolledStudents?.includes(user._id)) {
                        navigate('/dashboard', { state: { tab: 'upcoming_sessions' } });
                      } else {
                        handleEnroll(workshop._id);
                      }
                    }}
                    disabled={enrollingId === workshop._id || (workshop.enrolledCount >= workshop.capacity && !(user && (workshop.enrolledStudents?.includes(user._id) || workshop.mentor._id === user._id)))}
                  >
                    {enrollingId === workshop._id ? 'Enrolling...' : (user && workshop.mentor._id === user._id) ? 'Manage' : (user && workshop.enrolledStudents?.includes(user._id)) ? 'View' : workshop.enrolledCount >= workshop.capacity ? 'Sold Out' : 'Enroll (Demo)'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Workshops;
