import dotenv from 'dotenv';
dotenv.config();
import { StreamChat } from 'stream-chat';
const apiKey = process.env.STREAM_API_KEY || '7jbstm59ag9c';
const apiSecret = process.env.STREAM_API_SECRET || 'sy9saxxzw9h7xr2mchjbcxch4vtbxm4j7jt9vesht2tdzkbja4et8wxezydyzq6w';
const chatClient = StreamChat.getInstance(apiKey, apiSecret);
async function test() {
  try {
    await chatClient.upsertUsers([
      { id: 'test_user_1', name: 'User 1' },
      { id: 'test_user_2', name: 'User 2' }
    ]);
    const channel = chatClient.channel('messaging', 'test_channel_1234', {
      name: 'Session Chat',
      created_by_id: 'test_user_1',
      members: ['test_user_1', 'test_user_2']
    } as Record<string, any>);
    await channel.create();
    console.log('Success');
  } catch(e: any) {
    console.error('Error:', e.message);
  }
}
test();
