import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Calendar, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/LandingPage.css';

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Unlock Your Potential with <br />
            <span className="text-gradient">World-Class Mentors</span>
          </h1>
          <p className="hero-subtitle">
            Connect with industry experts, schedule 1-on-1 video sessions, and accelerate your career growth today.
          </p>
          <div className="hero-actions">
            <button className="btn-primary flex-center" onClick={handleCTA}>
              Find a Mentor <ArrowRight className="ml-2" size={20} />
            </button>
            <button className="btn-secondary" onClick={handleCTA}>Become a Mentor</button>
          </div>
        </div>
        
        {/* Abstract shapes for premium feel */}
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="section-header">
          <h2>How MentorConnect Works</h2>
          <p>Your journey to excellence in three simple steps</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper">
              <Users className="feature-icon" />
            </div>
            <h3>Discover Experts</h3>
            <p>Browse through our vetted list of top-tier professionals across various industries and domains.</p>
          </div>
          
          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper">
              <Calendar className="feature-icon" />
            </div>
            <h3>Book Sessions</h3>
            <p>Seamlessly schedule 1-on-1 meetings based on real-time availability and secure your slot instantly.</p>
          </div>
          
          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper">
              <Award className="feature-icon" />
            </div>
            <h3>Achieve Goals</h3>
            <p>Join high-quality HD video calls, get personalized guidance, and track your progress.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
