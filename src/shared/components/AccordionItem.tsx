import React, { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  total?: number;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ 
  title, 
  children, 
  total,
  isOpen = false,
  onToggle 
}) => {
  const [isExpanded, setIsExpanded] = useState(isOpen);
  const { isDark } = useTheme();

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (onToggle) onToggle();
  };

  return (
    <div className={`border rounded-lg mb-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <button
        className={`w-full text-left p-4 flex justify-between items-center ${
          isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
        } rounded-lg focus:outline-none`}
        onClick={handleToggle}
      >
        <div className="flex items-center">
          <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
            ▶
          </span>
          <span className="ml-2 font-medium">{title}</span>
          {total !== undefined && (
            <span className="ml-4 text-sm text-gray-500">
              Total: €{total.toFixed(2)}
            </span>
          )}
        </div>
      </button>
      
      {isExpanded && (
        <div className={`p-4 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          {children}
        </div>
      )}
    </div>
  );
};
