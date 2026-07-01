import dotenv from 'dotenv';
dotenv.config();
import { StreamChat } from 'stream-chat';
import mongoose from 'mongoose';
import Booking from './src/models/Booking';

const apiKey = process.env.STREAM_API_KEY || '7jbstm59ag9c';
const apiSecret = process.env.STREAM_API_SECRET || 'sy9saxxzw9h7xr2mchjbcxch4vtbxm4j7jt9vesht2tdzkbja4et8wxezydyzq6w';
const chatClient = StreamChat.getInstance(apiKey, apiSecret);

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mentorconnect');
    
    // Let's just find one booking
    const booking = await Booking.findOne().populate('mentor').populate('student');
    if (!booking) {
      console.log('No booking found');
      return;
    }
    
    const mentorId = (booking.mentor as any)._id.toString();
    const studentId = (booking.student as any)._id.toString();
    
    console.log('Upserting:', mentorId, studentId);
    await chatClient.upsertUsers([
      { id: mentorId, name: (booking.mentor as any).name || 'Mentor', role: 'user' },
      { id: studentId, name: (booking.student as any).name || 'Student', role: 'user' }
    ]);
    
    const meetingId = 'call_' + booking._id.toString();
    console.log('Creating channel:', meetingId);
    const channel = chatClient.channel('messaging', meetingId, {
      name: 'Session Chat',
      created_by_id: mentorId,
      members: [mentorId, studentId]
    } as Record<string, any>);
    
    await channel.create();
    console.log('Channel created successfully for members:', [mentorId, studentId]);
    
  } catch(e: any) {
    console.error('Error:', e.message);
  } finally {
    mongoose.disconnect();
  }
}
test();
