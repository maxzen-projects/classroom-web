import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';

const Toast = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Allow animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const typeConfig = {
    success: {
      icon: FaCheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-400',
    },
    error: {
      icon: FaTimesCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-400',
    },
    warning: {
      icon: FaExclamationCircle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-400',
    },
    info: {
      icon: FaInfoCircle,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-400',
    },
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4 shadow-lg max-w-sm`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${config.textColor}`}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className={`inline-flex ${config.textColor} hover:opacity-75 transition-opacity`}
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;