import React from 'react';
import PropTypes from 'prop-types';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserGroupIcon, 
  TrendingUpIcon 
} from '@heroicons/react/24/outline';
import StatsCard from './StatsCard';
import WeeklyChart from './WeeklyChart';

// StatsWidgets component with grid layout
const StatsWidgets = ({ statsData, chartData }) => {
  // Default stats data structure
  const defaultStats = [
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

  // Use provided stats or default
  const stats = statsData || defaultStats;

  // Default chart data
  const defaultChartData = {
    attendanceData: [12, 19, 3, 5, 2, 3, 9],
    busyData: [2, 3, 20, 5, 1, 4, 8],
  };

  // Use provided chart data or default
  const chart = chartData || defaultChartData;

  return (
    <div className="space-y-6">
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Chart */}
        <div className="lg:col-span-2">
          <WeeklyChart
            attendanceData={chart.attendanceData}
            busyData={chart.busyData}
          />
        </div>
      </div>

      {/* Additional Stats Grid - Optional */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-blue-100/50 hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-semibold mb-2 text-blue-900">Quick Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-blue-700">Avg. Session Duration</span>
              <span className="font-semibold text-blue-800">2.3 hrs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Most Active Day</span>
              <span className="font-semibold text-blue-800">Wednesday</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Client Retention</span>
              <span className="font-semibold text-blue-800">89%</span>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-blue-100/50 hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-semibold mb-2 text-blue-900">Recent Activity</h3>
          <div className="space-y-2">
            <div className="text-sm text-blue-700">
              <span className="font-medium text-blue-800">John Doe</span> - Completed session
            </div>
            <div className="text-sm text-blue-700">
              <span className="font-medium text-blue-800">Jane Smith</span> - Booked for tomorrow
            </div>
            <div className="text-sm text-blue-700">
              <span className="font-medium text-blue-800">Mike Johnson</span> - Cancelled session
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-blue-100/50 hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-semibold mb-2 text-blue-900">Upcoming</h3>
          <div className="space-y-2">
            <div className="text-sm">
              <div className="font-medium text-blue-800">Next Session</div>
              <div className="text-blue-700">Today at 3:00 PM</div>
            </div>
            <div className="text-sm">
              <div className="font-medium text-blue-800">Available Slots</div>
              <div className="text-blue-700">5 slots this week</div>
            </div>
            <div className="text-sm">
              <div className="font-medium text-blue-800">Pending Reviews</div>
              <div className="text-blue-700">3 reviews to complete</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

StatsWidgets.propTypes = {
  statsData: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    trend: PropTypes.number.isRequired,
    icon: PropTypes.elementType,
  })),
  chartData: PropTypes.shape({
    attendanceData: PropTypes.arrayOf(PropTypes.number).isRequired,
    busyData: PropTypes.arrayOf(PropTypes.number).isRequired,
  }),
};

export default StatsWidgets;
