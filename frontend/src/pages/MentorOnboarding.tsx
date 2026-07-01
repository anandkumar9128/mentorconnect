import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/apiClient';
import '../styles/Auth.css'; // We'll reuse the auth styling

const MentorOnboarding: React.FC = () => {
  const { user, login } = useAuth();

  // Pre-fill name from auth context
  const [name, setName] = useState(user?.name || '');
  const [specialization, setSpecialization] = useState('');
  const [field, setField] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  
  // Social Links
  const [linkedin, setLinkedin] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiClient('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name,
          specialization,
          field,
          education,
          experience,
          profilePhoto,
          socialMedia: {
            linkedin,
            facebook,
            instagram,
          },
        }),
      });

      // Re-login with updated user data (which has isProfileComplete: true)
      // Keep the token since the API doesn't return a new one
      login({ ...data, token: user?.token });
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel" style={{ maxWidth: '600px' }}>
        <div className="auth-header">
          <h2 className="auth-title">Complete Your Profile</h2>
          <p className="auth-subtitle">Tell us more about your expertise so mentees can find you.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="specialization">Specialization *</label>
              <input
                type="text"
                id="specialization"
                placeholder="e.g. Frontend Developer"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="field">Industry Field *</label>
              <input
                type="text"
                id="field"
                placeholder="e.g. Software Engineering"
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="education">Education *</label>
              <input
                type="text"
                id="education"
                placeholder="e.g. B.Tech in CS"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="experience">Experience *</label>
              <input
                type="text"
                id="experience"
                placeholder="e.g. 5+ Years"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="profilePhoto">Profile Photo URL (Optional)</label>
            <input
              type="url"
              id="profilePhoto"
              placeholder="https://example.com/photo.jpg"
              value={profilePhoto}
              onChange={(e) => setProfilePhoto(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label style={{ marginBottom: '1rem', display: 'block', fontWeight: 'bold' }}>Social Profiles (Optional)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="url"
                placeholder="LinkedIn URL"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="form-input"
              />
              <input
                type="url"
                placeholder="Instagram URL"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="form-input"
              />
              <input
                type="url"
                placeholder="Facebook URL"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {error && <div className="error-message" style={{ color: 'var(--error-color)', fontSize: '0.9rem', textAlign: 'center', marginTop: '1rem' }}>{error}</div>}

          <button type="submit" className="btn-primary auth-submit" style={{ marginTop: '2rem' }} disabled={loading}>
            {loading ? 'Saving Profile...' : 'Complete Profile & Go to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MentorOnboarding;
