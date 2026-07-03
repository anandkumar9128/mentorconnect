import React, { useEffect, useState } from 'react';
import { 
  StreamCall, 
  StreamVideo, 
  StreamVideoClient, 
  CallControls, 
  StreamTheme,
  ParticipantView,
  useCallStateHooks
} from '@stream-io/video-react-sdk';
import { StreamChat } from 'stream-chat';
import { Chat, Channel, MessageList, MessageComposer, Window } from 'stream-chat-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/apiClient';
import { SpeakerLayout } from '@stream-io/video-react-sdk';

import '@stream-io/video-react-sdk/dist/css/styles.css';
import 'stream-chat-react/dist/css/index.css';
import '../styles/VideoRoom.css';

interface VideoRoomProps {
  meetingId: string;
  onLeave: () => void;
}

const apiKey = import.meta.env.VITE_STREAM_API_KEY || '7jbstm59ag9c';

interface CustomVideoLayoutProps {
  isWorkshop: boolean;
  isMentor: boolean;
  onCompleteSession: () => void;
}

// The custom layout component that sits inside StreamCall
const CustomVideoLayout: React.FC<CustomVideoLayoutProps> = ({ isWorkshop, isMentor, onCompleteSession }) => {
  const { useParticipants, useLocalParticipant } = useCallStateHooks();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();

  // Find the other participant (the one who is not the local user)
  const otherParticipant = participants.find((p) => p.sessionId !== localParticipant?.sessionId);

  return (
    <div className="custom-video-layout">
      
      {/* LEFT: Main Video Area */}
      <div className="main-video-area">
        {isWorkshop ? (
          <div style={{ height: '100%', width: '100%', position: 'relative' }}>
            <SpeakerLayout />
          </div>
        ) : otherParticipant ? (
          <ParticipantView participant={otherParticipant} />
        ) : (
          <div className="waiting-screen">
            <div className="spinner"></div>
            <p>Waiting for the other participant to join...</p>
          </div>
        )}

        <div className="floating-controls">
          {(!isWorkshop || isMentor) ? (
            <CallControls />
          ) : (
            <div style={{ background: 'rgba(0,0,0,0.6)', padding: '10px 20px', borderRadius: '30px', color: 'white' }}>
              Audience Mode
            </div>
          )}
          
          {isWorkshop && isMentor && (
            <button 
              className="btn-primary" 
              style={{ marginLeft: '1rem', background: 'var(--success-color)' }}
              onClick={onCompleteSession}
            >
              Complete Session
            </button>
          )}
        </div>
      </div>

      {/* RIGHT: Sidebar */}
      <div className="sidebar-area">
        <div className="chat-section">
          <div className="chat-header">Meeting Chat</div>
          <Window>
            <MessageList />
            <MessageComposer />
          </Window>
        </div>

        <div className="local-video-section">
          {localParticipant && (
            <ParticipantView participant={localParticipant} />
          )}
        </div>
      </div>

    </div>
  );
};

const VideoRoom: React.FC<VideoRoomProps> = ({ meetingId, onLeave }) => {
  const { user } = useAuth();
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [call, setCall] = useState<any>(null);
  const [channel, setChannel] = useState<any>(null);
  const [error, setError] = useState('');
  
  const isWorkshop = meetingId.startsWith('workshop_');
  const isMentor = user?.role === 'mentor';

  const handleCompleteSession = async () => {
    if (window.confirm('Are you sure you want to end and complete this workshop? Your earnings will be transferred.')) {
      try {
        const workshopId = meetingId.replace('workshop_', '');
        await apiClient(`/workshops/${workshopId}/complete`, {
          method: 'POST'
        });
        alert('Workshop completed successfully! Earnings have been added to your wallet.');
        onLeave();
      } catch (err: any) {
        alert(err.message || 'Failed to complete workshop');
      }
    }
  };

  useEffect(() => {
    if (!user) return;

    let vClient: StreamVideoClient;
    let cClient: StreamChat;

    const initClients = async () => {
      try {
        const data = await apiClient(`/video/token?meetingId=${meetingId}`);
        const token = data.token;

        const streamUser = {
          id: user._id,
          name: user.name,
          image: user.role === 'mentor' ? (user as any).profilePhoto : undefined,
        };

        // Initialize Video Client
        vClient = new StreamVideoClient({ apiKey, user: streamUser, token });
        setVideoClient(vClient);

        const currentCall = vClient.call('default', meetingId);
        await currentCall.join({ create: true });
        setCall(currentCall);

        // Initialize Chat Client
        cClient = StreamChat.getInstance(apiKey);
        await cClient.connectUser(streamUser, token);
        setChatClient(cClient);

        // Create or join the chat channel using the same meetingId
        const chatChannel = cClient.channel('messaging', meetingId, {
          name: 'Session Chat',
        } as Record<string, any>);
        await chatChannel.watch();
        setChannel(chatChannel);

      } catch (err: any) {
        console.error('Failed to initialize stream clients:', err);
        setError('Failed to join the meeting. Please try again.');
      }
    };

    initClients();

    return () => {
      if (vClient) vClient.disconnectUser();
      if (cClient) cClient.disconnectUser();
    };
  }, [meetingId, user]);

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>
        <p style={{ color: 'var(--error-color)' }}>{error}</p>
        <button className="btn btn-primary" onClick={onLeave} style={{ marginTop: '1rem' }}>Go Back</button>
      </div>
    );
  }

  if (!videoClient || !call || !chatClient || !channel) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Connecting to meeting...</div>;
  }

  return (
    <StreamVideo client={videoClient}>
      <StreamTheme>
        <StreamCall call={call}>
          <Chat client={chatClient} theme="str-chat__theme-dark">
            <Channel channel={channel}>
              <CustomVideoLayout 
                isWorkshop={isWorkshop} 
                isMentor={isMentor} 
                onCompleteSession={handleCompleteSession}
              />
            </Channel>
          </Chat>
        </StreamCall>
      </StreamTheme>
    </StreamVideo>
  );
};

export default VideoRoom;
