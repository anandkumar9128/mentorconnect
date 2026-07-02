import React, { type ReactNode } from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

interface BookingDateTimeProps {
  date: string;
  setDate: (date: string) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  duration: number;
  setDuration: (duration: number) => void;
  children?: ReactNode;
}

const BookingDateTime: React.FC<BookingDateTimeProps> = ({
  date,
  setDate,
  startTime,
  setStartTime,
  duration,
  setDuration,
  children
}) => {
  return (
    <>
      <div className="form-group" style={{ marginBottom: "1rem" }}>
        <label className="modal-label">
          <CalendarIcon size={16} /> Select Date
        </label>
        <input
          type="date"
          className="form-input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          required
        />
      </div>

      {children}

      <div className="form-group" style={{ marginBottom: "1.5rem" }}>
        <label className="modal-label">
          <Clock size={16} /> Start Time
        </label>
        <input
          type="time"
          className="form-input"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </div>

      <div className="form-group" style={{ marginBottom: "2rem" }}>
        <label className="modal-label">Duration</label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[30, 60, 90, 120].map(mins => (
            <button
              key={mins}
              type="button"
              onClick={() => setDuration(mins)}
              style={{
                flex: '1 1 calc(25% - 0.5rem)',
                padding: '0.6rem',
                borderRadius: '8px',
                border: `1px solid ${duration === mins ? 'var(--primary-color)' : 'var(--border-color)'}`,
                background: duration === mins ? 'var(--primary-color)' : 'transparent',
                color: duration === mins ? '#ffffff' : 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: 500,
                textAlign: 'center',
                minWidth: '70px'
              }}
            >
              {mins} min
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default BookingDateTime;
