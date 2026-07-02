import React from 'react';
import Avatar from './Avatar';
import type { Booking } from '../types';

interface SessionListProps {
  title: string;
  bookings: Booking[];
  emptyMessage: string;
  role: 'student' | 'mentor';
}

const SessionList: React.FC<SessionListProps> = ({ title, bookings, emptyMessage, role }) => {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
      <h3 style={{ marginBottom: '1rem' }}>{title}</h3>
      {bookings.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bookings.map(booking => {
            const user = role === 'mentor' ? (booking.student as any) : (booking.mentor as any);
            return (
              <div key={booking._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Avatar size={40} src={user?.profilePhoto} alt={user?.name} />
                  <div>
                    <div style={{ fontWeight: 500 }}>{user?.name}</div>
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
            )
          })}
        </div>
      ) : (
        <p className="text-secondary">{emptyMessage}</p>
      )}
    </div>
  );
};

export default SessionList;
