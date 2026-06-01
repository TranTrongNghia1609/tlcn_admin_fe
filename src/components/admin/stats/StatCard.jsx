import React from 'react';
import { Card } from '../../ui/card';

const StatCard = ({ title, value, description, icon: Icon, trend }) => {
  const getTrendColor = () => {
    if (!trend) return 'text-gray-500';
    const numericTrend = parseFloat(trend);
    return numericTrend > 0 ? 'text-green-500' : 'text-red-500';
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    const numericTrend = parseFloat(trend);
    return numericTrend > 0 ? '▲' : '▼';
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</h3>
          {description && (
            <p className="text-xs text-gray-500 dark:text-slate-400">{description}</p>
          )}
          {trend && (
            <p className={`text-sm font-medium mt-2 ${getTrendColor()}`}>
              {getTrendIcon()} {trend} {title.includes('6m') ? '6m growth' : title.includes('1y') ? '1y growth' : '2y growth'}
            </p>
          )}
        </div>
        {Icon && (
          <div className="ml-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;