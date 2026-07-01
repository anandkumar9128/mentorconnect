import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import MentorOnboarding from './MentorOnboarding';
import StudentDashboard from './StudentDashboard';
import MentorDashboard from './MentorDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'mentor' && !user.isProfileComplete) {
    return <MentorOnboarding />;
  }

  if (user.role === 'student') {
    return <StudentDashboard />;
  }

  if (user.role === 'mentor') {
    return <MentorDashboard />;
  }

  return <Navigate to="/" replace />;
};

export default Dashboard;
