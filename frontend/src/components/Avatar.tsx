import React from 'react';
import { User as UserIcon } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 50, className = '' }) => {
  if (src) {
    return (
      <img 
        src={src} 
        alt={alt} 
        className={`avatar-img ${className}`}
        style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%', objectFit: 'cover' }} 
      />
    );
  }

  return (
    <div 
      className={`mentor-avatar-fallback flex-center ${className}`} 
      style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <UserIcon size={size * 0.5} color="var(--text-secondary)" />
    </div>
  );
};

export default Avatar;
