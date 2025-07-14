import React from 'react';
import { CalendarIcon, ClockIcon, UserGroupIcon, TrendingUpIcon } from '@heroicons/react/24/outline';
import StatsWidgets from './StatsWidgets';

// Example usage of the StatsWidgets component
const StatsWidgetsExample = () => {
  // Sample data for stats cards
  const sampleStatsData = [
    {
      title: 'Total Sessions',
      value: '24',
      trend: 12,
      icon: CalendarIcon,
    },
    {
      title: 'Hours Trained',
      value: '48',
      trend: 8,
      icon: ClockIcon,
    },
    {
      title: 'Active Clients',
      value: '15',
      trend: -3,
      icon: UserGroupIcon,
    },
    {
      title: 'Success Rate',
      value: '94%',
      trend: 5,
      icon: TrendingUpIcon,
    },
  ];

  // Sample chart data
  const sampleChartData = {
    attendanceData: [12, 19, 3, 5, 2, 3, 9],
    busyData: [2, 3, 20, 5, 1, 4, 8],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Trainer Dashboard Stats
          </h1>
          <p className="text-blue-700">
            Monitor your performance and track key metrics with visual hierarchy
          </p>
        </div>

        {/* Stats Widgets with Grid Layout */}
        <StatsWidgets
          statsData={sampleStatsData}
          chartData={sampleChartData}
        />
      </div>
    </div>
  );
};

export default StatsWidgetsExample;
