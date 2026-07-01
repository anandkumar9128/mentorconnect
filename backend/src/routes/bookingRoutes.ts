import express from 'express';
import { createBooking, getBookings, getMentorAvailability } from '../controllers/bookingController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').post(protect, createBooking).get(protect, getBookings);
router.get('/mentor/:mentorId/availability', protect, getMentorAvailability);

export default router;
