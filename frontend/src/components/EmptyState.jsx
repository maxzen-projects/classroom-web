import React from 'react';
import { FaInbox, FaSearch, FaUsers, FaSchool, FaExclamationTriangle, FaBook, FaCalendarAlt } from 'react-icons/fa';

const iconMap = {
  inbox: FaInbox,
  search: FaSearch,
  users: FaUsers,
  school: FaSchool,
  error: FaExclamationTriangle,
  book: FaBook,
  calendar: FaCalendarAlt,
};

const EmptyState = ({
  icon = 'inbox',
  title = 'No data found',
  description = 'There is no data to display at the moment.',
  action,
  className = ''
}) => {
  const IconComponent = typeof icon === 'string' ? iconMap[icon] || FaInbox : icon;

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <IconComponent className="w-8 h-8 text-gray-400" />
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>

      <p className="text-gray-500 mb-6 max-w-sm">
        {description}
      </p>

      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
};

// Predefined empty states for common scenarios
export const EmptySearch = (props) => (
  <EmptyState
    icon={FaSearch}
    title="No results found"
    description="Try adjusting your search criteria or filters."
    {...props}
  />
);

export const EmptyError = (props) => (
  <EmptyState
    icon={FaExclamationTriangle}
    title="Something went wrong"
    description="We encountered an error while loading the data."
    {...props}
  />
);

export default EmptyState;
