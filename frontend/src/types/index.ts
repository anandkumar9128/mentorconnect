export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'mentor' | 'admin';
  isApproved: boolean;
  isProfileComplete?: boolean;
  hourlyRate?: number;
  token: string;
}

export interface Mentor {
  _id: string;
  name: string;
  specialization: string;
  field: string;
  experience: string;
  education: string;
  hourlyRate: number;
  profilePhoto?: string;
}

export interface Booking {
  _id: string;
  student: {
    name: string;
    email: string;
    profilePhoto?: string;
  };
  mentor?: {
    name: string;
    specialization: string;
    profilePhoto?: string;
    hourlyRate?: number;
  };
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalPrice: number;
  status: string;
  meetingProvider?: string;
  meetingId?: string;
  meetingLink?: string;
}
