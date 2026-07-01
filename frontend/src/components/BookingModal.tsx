import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import type { Mentor } from '../types';
import { loadScript } from '../utils/loadScript';

interface BookingModalProps {
  mentor: Mentor;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ mentor, isOpen, onClose, onSuccess }) => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(60); // minutes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Availability state
  const [busySlots, setBusySlots] = useState<{ startTime: string, endTime: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  if (!isOpen) return null;

  // Assuming mentor.hourlyRate might be undefined, fallback to 50
  const rate = mentor.hourlyRate || 50;
  const totalPrice = (rate * duration) / 60;

  // Fetch busy slots when date changes
  React.useEffect(() => {
    if (!date) {
      setBusySlots([]);
      return;
    }

    const fetchAvailability = async () => {
      setLoadingSlots(true);
      try {
        const data = await apiClient(`/bookings/mentor/${mentor._id}/availability?date=${date}`);
        setBusySlots(data);
      } catch (err) {
        console.error('Failed to fetch availability', err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailability();
  }, [date, mentor._id]);

  // Calculate End Time based on Start Time + duration (simplistic approach for MVP)
  const calculateEndTime = () => {
    if (!startTime) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    const dateObj = new Date();
    dateObj.setHours(hours, minutes + duration);
    return dateObj.toTimeString().substring(0, 5); // Returns HH:MM
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !startTime) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create a pending booking
      const bookingData = await apiClient('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          mentorId: mentor._id,
          date,
          startTime,
          endTime: calculateEndTime(),
          duration,
        }),
      });

      // 2. Load Razorpay script
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        throw new Error('Razorpay SDK failed to load. Are you online?');
      }

      // 3. Create a payment order via backend
      const order = await apiClient('/payments/order', {
        method: 'POST',
        body: JSON.stringify({ bookingId: bookingData._id }),
      });

      // 4. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SItoIb4PVaW0Yy',
        amount: order.amount,
        currency: order.currency,
        name: 'MentorConnect',
        description: `Session with ${mentor.name}`,
        order_id: order.orderId,
        handler: async function (response: any) {
          try {
            await apiClient('/payments/verify', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: bookingData._id,
              }),
            });
            onSuccess();
            onClose();
          } catch (err: any) {
            setError(err.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: 'Student',
          email: 'student@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#6366f1',
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on('payment.failed', function (response: any) {
        setError(response.error.description);
      });
      paymentObject.open();

    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={overlayStyle}>
      <div className="modal-content glass-panel" style={contentStyle}>
        <button onClick={onClose} style={closeBtnStyle}><X size={24} /></button>
        
        <h2 style={{ marginBottom: '1.5rem' }}>Book Session with {mentor.name}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}><CalendarIcon size={16} /> Select Date</label>
            <input 
              type="date" 
              className="form-input" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              min={new Date().toISOString().split('T')[0]}
              required 
            />
          </div>

          {date && (
            <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Schedule Overview</h4>
              {loadingSlots ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-color)' }}>Checking availability...</div>
              ) : busySlots.length > 0 ? (
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#f59e0b', marginBottom: '0.5rem' }}>
                    Mentor has bookings at these times:
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {busySlots.map((slot, index) => (
                      <li key={index} style={{ fontSize: '0.8rem', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {slot.startTime} - {slot.endTime}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: '#10b981' }}>Mentor is completely free on this date!</div>
              )}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label style={labelStyle}><Clock size={16} /> Start Time</label>
              <input 
                type="time" 
                className="form-input" 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label style={labelStyle}>Duration (mins)</label>
              <select 
                className="form-input" 
                value={duration} 
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                <option value={30}>30 mins</option>
                <option value={60}>60 mins</option>
                <option value={90}>90 mins</option>
                <option value={120}>120 mins</option>
              </select>
            </div>
          </div>

          <div style={priceContainerStyle}>
            <span style={{ color: 'var(--text-secondary)' }}>Total Price:</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{totalPrice.toFixed(2)}</span>
          </div>

          {error && <div style={{ color: 'var(--error-color)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Requesting...' : 'Request Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Inline styles for the modal overlay
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(5px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const contentStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '500px',
  padding: '2rem',
  position: 'relative',
};

const closeBtnStyle: React.CSSProperties = {
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  background: 'transparent',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginBottom: '0.5rem',
  color: 'var(--text-secondary)',
  fontSize: '0.9rem',
};

const priceContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem',
  background: 'rgba(255,255,255,0.05)',
  borderRadius: '8px',
  marginBottom: '1.5rem',
  marginTop: '1rem',
};

export default BookingModal;
