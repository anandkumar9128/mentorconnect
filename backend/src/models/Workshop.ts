import mongoose from 'mongoose';

const workshopSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true, // in minutes
  },
  price: {
    type: Number,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  enrolledCount: {
    type: Number,
    default: 0,
  },
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  bannerImage: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed'],
    default: 'scheduled',
  }
}, {
  timestamps: true,
});

workshopSchema.index({ mentor: 1, date: 1 });
workshopSchema.index({ enrolledStudents: 1 });

const Workshop = mongoose.model('Workshop', workshopSchema);

export default Workshop;
