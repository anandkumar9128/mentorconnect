import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Booking from '../models/Booking';
import User from '../models/User';

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const { mentorId, date, startTime, endTime, duration } = req.body;

  const mentor = await User.findById(mentorId);

  if (!mentor || mentor.role !== 'mentor') {
    res.status(404);
    throw new Error('Mentor not found');
  }

  // Check for overlapping bookings
  const overlappingBookings = await Booking.find({
    mentor: mentorId,
    date,
    status: { $ne: 'cancelled' },
    $and: [
      { startTime: { $lt: endTime } },
      { endTime: { $gt: startTime } }
    ]
  });

  if (overlappingBookings.length > 0) {
    res.status(400);
    throw new Error('This time slot is already booked. Please choose another time.');
  }

  // Calculate total price based on mentor's hourly rate (default to 50 if not set)
  const hours = duration / 60;
  const rate = mentor.hourlyRate || 50;
  const totalPrice = rate * hours;

  const booking = await Booking.create({
    student: (req as any).user._id,
    mentor: mentorId,
    date,
    startTime,
    endTime,
    duration,
    totalPrice,
    status: 'pending',
  });

  res.status(201).json(booking);
});

// @desc    Get logged in user's bookings
// @route   GET /api/bookings
// @access  Private
export const getBookings = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;

  let bookings;

  if (user.role === 'mentor') {
    // If mentor, find bookings where they are the mentor
    bookings = await Booking.find({ mentor: user._id })
      .populate('student', 'name email profilePhoto')
      .sort({ date: 1, startTime: 1 });
  } else {
    // If student, find bookings where they are the student
    bookings = await Booking.find({ student: user._id })
      .populate('mentor', 'name specialization profilePhoto hourlyRate')
      .sort({ date: 1, startTime: 1 });
  }

  res.json(bookings);
});

// @desc    Get mentor's booked slots for a specific date
// @route   GET /api/bookings/mentor/:mentorId/availability?date=YYYY-MM-DD
// @access  Private
export const getMentorAvailability = asyncHandler(async (req: Request, res: Response) => {
  const { mentorId } = req.params;
  const { date } = req.query;

  if (!date) {
    res.status(400);
    throw new Error('Date is required');
  }

  const bookings = await Booking.find({
    mentor: mentorId,
    date: new Date(date as string),
    status: { $ne: 'cancelled' },
  }).select('startTime endTime -_id').sort({ startTime: 1 });

  res.json(bookings);
});
