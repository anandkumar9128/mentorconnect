import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'mentor' | 'admin';
  isApproved: boolean; // For mentors
  isProfileComplete: boolean;
  hourlyRate?: number;
  walletBalance?: number;
  profilePhoto?: string;
  bio?: string;
  specialization?: string;
  field?: string;
  education?: string;
  experience?: string;
  socialMedia?: {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
  };
}

const userSchema: Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'mentor', 'admin'],
      default: 'student',
    },
    isApproved: {
      type: Boolean,
      default: function(this: any) {
        // Auto-approve mentors for testing purposes (as per updated plan)
        if (this.role === 'mentor') return true;
        return false;
      }
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    hourlyRate: {
      type: Number,
      default: 50, // default rate
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    profilePhoto: String,
    bio: String,
    specialization: String,
    field: String,
    education: String,
    experience: String,
    socialMedia: {
      linkedin: String,
      instagram: String,
      facebook: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ role: 1, isProfileComplete: 1 });
userSchema.index({ email: 1 });

// Encrypt password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
