import React from 'react';

const DashboardCard = ({ title, value, icon: Icon, color = 'blue', description }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    success: 'bg-success-soft border-success text-success',
    danger: 'bg-danger-soft border-danger text-danger',
    warning: 'bg-warning-soft border-warning text-warning',
    secondary: 'bg-card-alt border-border text-text-muted'
  };

  const iconColorMap = {
    blue: 'text-primary',
    green: 'text-green-600',
    purple: 'text-purple-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    success: 'text-success',
    danger: 'text-danger',
    warning: 'text-warning',
    secondary: 'text-text-muted'
  };

  const selectedColor = colorClasses[color] || colorClasses.blue;
  const selectedIconColor = iconColorMap[color] || iconColorMap.blue;
  
  // Create icon background color by extracting the background color
  const iconBgColor = selectedColor.split(' ').find(cls => cls.startsWith('bg-')) || 'bg-blue-50';

  return (
    <div className={`card p-6 ${selectedColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-muted mb-1">{title}</p>
          <p className="text-2xl font-bold text-text">{value}</p>
          {description && (
            <p className="text-xs text-text-muted mt-1">{description}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-full ${iconBgColor} opacity-30`}>
            <Icon className={`w-6 h-6 ${selectedIconColor}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;