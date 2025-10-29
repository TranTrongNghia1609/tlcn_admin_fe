import React from 'react';
import { Button } from '../../ui/button';

const TimelineSelector = ({ selectedPeriod, onPeriodChange }) => {
  const periods = [
    { value: 'week', label: '1 Tuần', points: 7 },
    { value: 'month', label: '1 Tháng', points: 30 },
    { value: 'quarter', label: '1 Quý', points: 10 },
    { value: 'year', label: '1 Năm', points: 12 }
  ];

  return (
    <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
      {periods.map(period => (
        <Button
          key={period.value}
          variant={selectedPeriod === period.value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onPeriodChange(period.value)}
          className={`
            ${selectedPeriod === period.value 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }
          `}
        >
          {period.label}
        </Button>
      ))}
    </div>
  );
};

export default TimelineSelector;