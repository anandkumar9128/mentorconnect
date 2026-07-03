import { useState, useEffect, useMemo, useCallback } from 'react';
import { apiClient } from '../api/apiClient';
import type { Booking, Workshop } from '../types';
import { isSessionExpired } from '../utils/sessionUtils';

export const useBookingsData = (role: 'mentor' | 'student', user: any) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [myWorkshops, setMyWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const workshopRoute = role === 'mentor' ? "/workshops/mentor" : "/workshops/student";
      const [bookingsData, workshopsData] = await Promise.all([
        apiClient("/bookings"),
        apiClient(workshopRoute)
      ]);

      const mappedWorkshops: Booking[] = workshopsData.map((w: Workshop) => {
        const [hours, minutes] = w.startTime.split(':').map(Number);
        const endDate = new Date(w.date);
        endDate.setHours(hours, minutes + w.duration, 0, 0);
        const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

        return {
          _id: w._id,
          student: user, // Standardizes BookingCard display
          mentor: role === 'student' ? w.mentor : user,
          date: w.date,
          startTime: w.startTime,
          endTime,
          duration: w.duration,
          totalPrice: role === 'mentor' ? (w.price * w.enrolledCount) : w.price,
          status: w.status === 'completed' ? 'completed' : 'paid',
          isWorkshop: true,
          workshopTitle: w.title,
          meetingId: `workshop_${w._id}`
        };
      });

      const allSessions = [...bookingsData, ...mappedWorkshops].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateA !== dateB) return dateA - dateB;
        return a.startTime.localeCompare(b.startTime);
      });

      setBookings(allSessions);
      setMyWorkshops(workshopsData);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [role, user]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [fetchData, user]);

  const upcomingBookings = useMemo(() => 
    bookings.filter(b => (b.status === "paid" || b.status === "pending") && !isSessionExpired(b.date, b.endTime)),
  [bookings]);

  const completedBookings = useMemo(() => 
    bookings.filter(b => b.status === "completed" || ((b.status === "paid" || b.status === "pending") && isSessionExpired(b.date, b.endTime))),
  [bookings]);

  return { 
    bookings, 
    setBookings, 
    myWorkshops, 
    setMyWorkshops, 
    loading, 
    error, 
    upcomingBookings, 
    completedBookings,
    refetchData: fetchData 
  };
};
