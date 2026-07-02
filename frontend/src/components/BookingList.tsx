import React from 'react';
import BookingCard from './BookingCard';
import type { Booking } from '../types';

interface BookingListProps {
  title: string;
  subtitle?: string;
  bookings: Booking[];
  emptyTitle: string;
  emptySubtitle: string;
  role: 'student' | 'mentor';
  loading?: boolean;
  onJoinMeeting: (meetingId: string) => void;
}

const BookingList: React.FC<BookingListProps> = ({ 
  title, 
  subtitle,
  bookings, 
  emptyTitle, 
  emptySubtitle, 
  role, 
  loading,
  onJoinMeeting 
}) => {
  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h3 style={{ marginBottom: subtitle ? '0.5rem' : '1.5rem' }}>{title}</h3>
      {subtitle && <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>{subtitle}</p>}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <h3>{emptyTitle}</h3>
          <p className="text-secondary">{emptySubtitle}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bookings.map((booking) => (
            <BookingCard 
              key={booking._id} 
              booking={booking} 
              role={role} 
              onJoinMeeting={onJoinMeeting} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingList;
