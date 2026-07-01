import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Booking } from '../models';
import { VideoService } from '../services/video/VideoService';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// @desc    Create a Razorpay order for a booking
// @route   POST /api/payments/order
// @access  Private (Student)
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { bookingId } = req.body;

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Ensure the user owns the booking
  if (booking.student.toString() !== (req as any).user?._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to pay for this booking');
  }

  if (booking.status !== 'pending') {
    res.status(400);
    throw new Error(`Cannot pay for a booking with status: ${booking.status}`);
  }

  // Calculate amount on backend (in paise for INR)
  const amountInPaise = Math.round(booking.totalPrice * 100);

  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: booking._id.toString(),
  };

  try {
    const order = await razorpay.orders.create(options);
    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingId: booking._id,
    });
  } catch (error: any) {
    console.error('Razorpay Order Error:', error);
    res.status(500);
    throw new Error('Failed to create payment order');
  }
});

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify
// @access  Private (Student)
export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

  const secret = process.env.RAZORPAY_KEY_SECRET || '';

  const generated_signature = crypto
    .createHmac('sha256', secret)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generated_signature === razorpay_signature) {
    // Payment is authentic
    const booking = await Booking.findById(bookingId);
    
    if (booking) {
      booking.status = 'paid';
      
      // Generate the Video Meeting using our abstraction layer
      const meetingDetails = await VideoService.createMeeting(
        booking._id.toString(),
        booking.mentor.toString(),
        booking.student.toString()
      );
      
      booking.meetingProvider = 'stream';
      booking.meetingId = meetingDetails.meetingId;
      booking.meetingLink = meetingDetails.meetingLink;
      
      await booking.save();
      res.status(200).json({ message: 'Payment verified successfully', booking });
    } else {
      res.status(404);
      throw new Error('Booking not found after payment');
    }
  } else {
    // Payment verification failed
    res.status(400);
    throw new Error('Payment verification failed');
  }
});
