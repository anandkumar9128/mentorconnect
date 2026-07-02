import React from 'react';
import Sidebar from './Sidebar';
import type { SidebarItem } from './Sidebar';

interface DashboardLayoutProps {
  sidebarItems: SidebarItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: any;
  onLogout: () => void;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  sidebarItems, activeTab, onTabChange, user, onLogout, children 
}) => {
  return (
    <div className="dashboard-layout">
      <Sidebar 
        items={sidebarItems} 
        activeTab={activeTab} 
        onTabChange={onTabChange} 
        user={user} 
        onLogout={onLogout} 
      />
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
