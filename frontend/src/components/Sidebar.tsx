import React from 'react';
import { LogOut } from 'lucide-react';
import Avatar from './Avatar';
import '../styles/Sidebar.css';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  items: SidebarItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  user: any;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ items, activeTab, onTabChange, user, onLogout }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2 className="text-gradient">MentorConnect</h2>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <Avatar src={user?.role === 'mentor' ? user?.profilePhoto : undefined} alt={user?.name || 'User'} size={40} />
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.name}</p>
            <p className="sidebar-user-role">{user?.role === 'mentor' ? 'Mentor' : 'Student'}</p>
          </div>
        </div>
        <button className="sidebar-logout" onClick={onLogout} title="Logout">
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
