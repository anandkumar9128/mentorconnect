import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/apiClient';
import '../styles/Auth.css';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'mentee' | 'mentor' | 'admin'>('mentee');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Map 'mentee' back to 'student' for the backend if necessary. Assuming backend handles it, or map here:
      const backendRole = role === 'mentee' ? 'student' : role;
      
      const data = await apiClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role: backendRole }),
      });

      login(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Create an Account</h2>
          </div>
          
          <div className="role-tabs">
            <button 
              type="button"
              className={`role-tab ${role === 'mentee' ? 'active' : ''}`}
              onClick={() => setRole('mentee')}
            >Mentee</button>
            <button 
              type="button"
              className={`role-tab ${role === 'mentor' ? 'active' : ''}`}
              onClick={() => setRole('mentor')}
            >Mentor</button>
            <button 
              type="button"
              className={`role-tab ${role === 'admin' ? 'active' : ''}`}
              onClick={() => setRole('admin')}
            >Admin</button>
          </div>

          <div className="action-tabs">
            <Link to="/login" className="action-tab">Sign in</Link>
            <div className="action-tab active">Create account</div>
          </div>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input 
                type="text" 
                id="name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required 
              />
            </div>
            
            {error && <div className="error-message" style={{ color: 'var(--error-color)', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
            
            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
