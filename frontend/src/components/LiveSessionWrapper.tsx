import React from 'react';
import VideoRoom from './VideoRoom';

interface LiveSessionWrapperProps {
  meetingId: string;
  onClose: () => void;
}

const LiveSessionWrapper: React.FC<LiveSessionWrapperProps> = ({ meetingId, onClose }) => {
  return (
    <div style={{ marginTop: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h3>Live Session</h3>
        <button 
          className="btn" 
          style={{ 
            backgroundColor: '#ef4444', 
            color: 'white', 
            border: 'none', 
            padding: '0.5rem 1rem', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'background-color 0.2s'
          }} 
          onClick={onClose}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
        >
          Close Video Room
        </button>
      </div>
      <VideoRoom
        meetingId={meetingId}
        onLeave={onClose}
      />
    </div>
  );
};

export default LiveSessionWrapper;
