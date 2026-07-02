import { useState } from 'react';
import { apiClient } from '../api/apiClient';
import { loadScript } from '../utils/loadScript';
import type { Mentor } from '../types';

interface UseBookingPaymentProps {
  mentor: Mentor;
  date: string;
  startTime: string;
  duration: number;
  onSuccess: () => void;
  onClose: () => void;
}

export const useBookingPayment = ({
  mentor,
  date,
  startTime,
  duration,
  onSuccess,
  onClose,
}: UseBookingPaymentProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateEndTime = () => {
    if (!startTime) return "";
    const [hours, minutes] = startTime.split(":").map(Number);
    const dateObj = new Date();
    dateObj.setHours(hours, minutes + duration);
    return dateObj.toTimeString().substring(0, 5);
  };

  const submitBooking = async () => {
    if (!date || !startTime) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Create a pending booking
      const bookingData = await apiClient("/bookings", {
        method: "POST",
        body: JSON.stringify({
          mentorId: mentor._id,
          date,
          startTime,
          endTime: calculateEndTime(),
          duration,
        }),
      });

      // 2. Load Razorpay script
      const res = await loadScript(
        "https://checkout.razorpay.com/v1/checkout.js",
      );
      if (!res) {
        throw new Error("Razorpay SDK failed to load. Are you online?");
      }

      // 3. Create a payment order via backend
      const order = await apiClient("/payments/order", {
        method: "POST",
        body: JSON.stringify({ bookingId: bookingData._id }),
      });

      // 4. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SItoIb4PVaW0Yy",
        amount: order.amount,
        currency: order.currency,
        name: "MentorConnect",
        description: `Session with ${mentor.name}`,
        order_id: order.orderId,
        handler: async function (response: any) {
          try {
            await apiClient("/payments/verify", {
              method: "POST",
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
            setError(err.message || "Payment verification failed");
          }
        },
        prefill: {
          name: "Student",
          email: "student@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#6366f1",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on("payment.failed", function (response: any) {
        setError(response.error.description);
      });
      paymentObject.open();
    } catch (err: any) {
      setError(err.message || "Failed to initialize payment");
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, submitBooking };
};
