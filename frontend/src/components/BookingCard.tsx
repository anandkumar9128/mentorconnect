import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import Avatar from './Avatar';
import type { Booking } from '../types';
import { isSessionExpired, isSessionActive } from '../utils/sessionUtils';

interface BookingCardProps {
  booking: Booking;
  role: 'student' | 'mentor';
  onJoinMeeting: (meetingId: string) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, role, onJoinMeeting }) => {
  const isExpired = isSessionExpired(booking.date, booking.endTime);
  const isActive = isSessionActive(booking.date, booking.startTime, booking.endTime);
  
  const otherUser = role === 'student' ? (booking.mentor as any) : (booking.student as any);

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Avatar src={otherUser?.profilePhoto} alt={otherUser?.name} size={50} />
        <div>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {booking.isWorkshop ? (
              <>
                <span style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-color)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Workshop</span>
                {booking.workshopTitle}
              </>
            ) : (
              role === 'student' ? `Session with ${otherUser?.name}` : otherUser?.name
            )}
          </h4>
          <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
            {booking.isWorkshop ? `by ${otherUser?.name}` : (role === 'mentor' ? otherUser?.email : '')}
          </p>
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
        {role === 'mentor' && (
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>₹{booking.totalPrice}</div>
        )}
        
        {booking.status === 'completed' ? (
           <span style={{ fontSize: '0.85rem', color: '#10b981' }}>Completed</span>
        ) : booking.status === 'paid' && isActive ? (
          <button 
            className="btn btn-primary" 
            style={{ marginTop: '0.5rem', display: 'block', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
            onClick={() => onJoinMeeting(booking.meetingId || `call_${booking._id}`)}
          >
            Join Meeting
          </button>
        ) : booking.status === 'paid' && !isExpired ? (
          <span style={{ fontSize: '0.85rem', color: '#10b981', display: 'block', marginTop: '0.5rem', fontWeight: 'bold' }}>
            Confirmed
          </span>
        ) : booking.status === 'paid' && isExpired ? (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Expired</span>
        ) : (
          <span style={{ 
            display: 'inline-block', 
            padding: '0.4rem 1rem', 
            borderRadius: '30px', 
            fontSize: '0.85rem',
            background: 'rgba(245, 158, 11, 0.1)',
            color: '#f59e0b',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            marginTop: role === 'mentor' ? '0.5rem' : '0'
          }}>
            {booking.status}
          </span>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
