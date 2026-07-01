import { StreamClient } from '@stream-io/node-sdk';
import { VideoProvider } from './VideoProvider';

export class StreamAdapter implements VideoProvider {
  private client: StreamClient;

  constructor() {
    const apiKey = process.env.STREAM_API_KEY || '7jbstm59ag9c';
    const apiSecret = process.env.STREAM_API_SECRET || 'sy9saxxzw9h7xr2mchjbcxch4vtbxm4j7jt9vesht2tdzkbja4et8wxezydyzq6w';
    
    if (!apiKey || !apiSecret) {
      console.warn('Stream API keys are missing!');
    }
    
    this.client = new StreamClient(apiKey, apiSecret);
  }

  async createMeeting(bookingId: string, mentorId: string, studentId: string): Promise<{ meetingId: string; meetingLink: string }> {
    const callId = `call_${bookingId}`;
    
    // In Stream, calls are created lazily when joined, but we can proactively create it via server
    const call = this.client.video.call('default', callId);
    
    await call.create({
      data: {
        created_by_id: mentorId,
        members: [
          { user_id: mentorId, role: 'host' },
          { user_id: studentId, role: 'call_member' }
        ],
        custom: {
          bookingId
        }
      }
    });

    return {
      meetingId: callId,
      // We will handle the link dynamically on frontend, but return a generic deep link just in case
      meetingLink: `/meeting/${callId}`
    };
  }

  async endMeeting(meetingId: string): Promise<void> {
    const call = this.client.video.call('default', meetingId);
    await call.end();
  }

  generateUserToken(userId: string): string {
    return this.client.generateUserToken({ user_id: userId });
  }
}
