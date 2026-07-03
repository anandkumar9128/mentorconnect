import React, { useState } from "react";
import { X } from "lucide-react";
import { apiClient } from "../api/apiClient";
import type { Mentor } from "../types";
import "../styles/BookingModal.css";

import BookingAvailability from "./BookingAvailability";
import BookingDateTime from "./BookingDateTime";
import { useBookingPayment } from "../hooks/useBookingPayment";

interface BookingModalProps {
  mentor: Mentor;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
  mentor,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(60); // minutes

  // Availability state
  const [busySlots, setBusySlots] = useState<
    { startTime: string; endTime: string }[]
  >([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const { loading, error, submitBooking } = useBookingPayment({
    mentor,
    date,
    startTime,
    duration,
    onSuccess,
    onClose,
  });

  // Fetch busy slots when date changes
  React.useEffect(() => {
    if (!date) {
      setBusySlots([]);
      return;
    }

    const fetchAvailability = async () => {
      setLoadingSlots(true);
      try {
        const data = await apiClient(
          `/bookings/mentor/${mentor._id}/availability?date=${date}`,
        );
        setBusySlots(data);
      } catch (err) {
        console.error("Failed to fetch availability", err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailability();
  }, [date, mentor._id]);

  if (!isOpen) return null;

  const rate = mentor.hourlyRate || 50;
  const totalPrice = (rate * duration) / 60;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitBooking();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel">
        <button onClick={onClose} className="close-btn">
          <X size={24} />
        </button>

        <h2 style={{ marginBottom: "1.5rem" }}>
          Book Session with {mentor.name}
        </h2>

        <form onSubmit={handleSubmit}>
          <BookingDateTime 
            date={date}
            setDate={setDate}
            startTime={startTime}
            setStartTime={setStartTime}
            duration={duration}
            setDuration={setDuration}
          >
            <BookingAvailability 
              date={date}
              loadingSlots={loadingSlots}
              busySlots={busySlots}
            />
          </BookingDateTime>

          <div className="price-container">
            <span style={{ color: "var(--text-secondary)" }}>Total Price:</span>
            <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              ₹{totalPrice.toFixed(2)}
            </span>
          </div>

          {error && (
            <div
              style={{
                color: "var(--error-color)",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? "Requesting..." : "Request Booking"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
