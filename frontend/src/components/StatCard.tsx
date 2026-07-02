import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, iconBgColor, iconColor }) => {
  return (
    <div className="stat-card glass-panel" style={{ borderRadius: '16px' }}>
      <div>
        <h3>{title}</h3>
        <div className="stat-value">{value}</div>
      </div>
      <div className="stat-icon" style={{ background: iconBgColor, color: iconColor }}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
