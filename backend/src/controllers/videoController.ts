import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { VideoService } from '../services/video/VideoService';
import { StreamChat } from 'stream-chat';
import Booking from '../models/Booking';

// @desc    Get video user token
// @route   GET /api/video/token
// @access  Private
export const getVideoToken = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id.toString();
  const meetingId = req.query.meetingId as string;
  
  try {
    const token = VideoService.generateUserToken(userId);

    // If meetingId is provided, lazily ensure the chat channel is created and both users are members.
    if (meetingId && meetingId.startsWith('call_')) {
      const apiKey = process.env.STREAM_API_KEY || '7jbstm59ag9c';
      const apiSecret = process.env.STREAM_API_SECRET || 'sy9saxxzw9h7xr2mchjbcxch4vtbxm4j7jt9vesht2tdzkbja4et8wxezydyzq6w';
      
      try {
        const chatClient = StreamChat.getInstance(apiKey, apiSecret);
        const bookingId = meetingId.replace('call_', '');
        const booking = await Booking.findById(bookingId)
          .populate('mentor', 'name')
          .populate('student', 'name');
        
        if (booking) {
          const mentorId = (booking.mentor as any)._id.toString();
          const studentId = (booking.student as any)._id.toString();
          
          await chatClient.upsertUsers([
            { id: mentorId, name: (booking.mentor as any).name || 'Mentor' },
            { id: studentId, name: (booking.student as any).name || 'Student' }
          ]);
          
          const channel = chatClient.channel('messaging', meetingId, {
            name: 'Session Chat',
            created_by_id: mentorId,
            members: [mentorId, studentId]
          } as Record<string, any>);
          
          await channel.create();
          await channel.addMembers([mentorId, studentId]);
        }
      } catch (chatError) {
        console.error('Failed to initialize stream chat channel:', chatError);
      }
    }

    res.status(200).json({ token });
  } catch (error) {
    console.error('Failed to generate video token:', error);
    res.status(500);
    throw new Error('Failed to generate video token');
  }
});
