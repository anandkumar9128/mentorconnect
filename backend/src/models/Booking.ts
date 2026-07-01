import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  student: mongoose.Types.ObjectId;
  mentor: mongoose.Types.ObjectId;
  date: Date;
  startTime: string; // e.g. "10:00"
  endTime: string;   // e.g. "11:00"
  duration: number;  // in minutes
  totalPrice: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  meetingProvider?: string;
  meetingId?: string;
  meetingLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema: Schema = new Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      default: 60,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'completed', 'cancelled'],
      default: 'pending',
    },
    meetingProvider: {
      type: String,
    },
    meetingId: {
      type: String,
    },
    meetingLink: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes to speed up queries
bookingSchema.index({ mentor: 1, date: 1 });
bookingSchema.index({ student: 1 });

const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
export default Booking;
