import React from 'react';

interface BookingAvailabilityProps {
  date: string;
  loadingSlots: boolean;
  busySlots: { startTime: string; endTime: string }[];
}

const BookingAvailability: React.FC<BookingAvailabilityProps> = ({ date, loadingSlots, busySlots }) => {
  if (!date) return null;

  return (
    <div
      style={{
        marginBottom: "1rem",
        padding: "1rem",
        background: "rgba(0,0,0,0.05)",
        borderRadius: "8px",
      }}
    >
      <h4
        style={{
          fontSize: "0.9rem",
          color: "var(--text-secondary)",
          marginBottom: "0.5rem",
        }}
      >
        Schedule Overview
      </h4>
      {loadingSlots ? (
        <div style={{ fontSize: "0.85rem", color: "var(--text-color)" }}>
          Checking availability...
        </div>
      ) : busySlots.length > 0 ? (
        <div>
          <p
            style={{
              fontSize: "0.85rem",
              color: "#f59e0b",
              marginBottom: "0.5rem",
            }}
          >
            Mentor has bookings at these times:
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            {busySlots.map((slot, index) => (
              <li
                key={index}
                style={{
                  fontSize: "0.8rem",
                  background: "rgba(245, 158, 11, 0.2)",
                  color: "#f59e0b",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "4px",
                }}
              >
                {slot.startTime} - {slot.endTime}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div style={{ fontSize: "0.85rem", color: "#10b981" }}>
          Mentor is completely free on this date!
        </div>
      )}
    </div>
  );
};

export default BookingAvailability;
