import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserGroupIcon, 
  TrendingUpIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ChartBarIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { StatsCard, WeeklyChart } from './widgets';

const DashboardOverview = ({ user, sessions, dashboardStats, calendarEvents }) => {
  // Sample data for demo - replace with actual data
  const sampleStatsData = [
    {
      title: 'Total Sessions',
      value: dashboardStats?.totalSessions || '24',
      trend: 12,
      icon: CalendarIcon,
    },
    {
      title: 'Hours Trained',
      value: dashboardStats?.busyHoursWeek || '48',
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
      value: `${dashboardStats?.attendancePercentage || 94}%`,
      trend: 5,
      icon: TrendingUpIcon,
    },
  ];

  const sampleChartData = {
    attendanceData: [12, 19, 3, 5, 2, 3, 9],
    busyData: [2, 3, 20, 5, 1, 4, 8],
  };

  const quickActions = [
    {
      title: 'Today\'s Sessions',
      count: dashboardStats?.todaySessions?.length || 0,
      icon: AcademicCapIcon,
      color: 'from-blue-500 to-cyan-500',
      description: 'Scheduled for today'
    },
    {
      title: 'Completed',
      count: dashboardStats?.attendedSessions || 0,
      icon: CheckCircleIcon,
      color: 'from-green-500 to-emerald-500',
      description: 'Sessions completed'
    },
    {
      title: 'Performance',
      count: `${dashboardStats?.attendancePercentage || 94}%`,
      icon: ChartBarIcon,
      color: 'from-purple-500 to-violet-500',
      description: 'Overall rating'
    },
    {
      title: 'Weekly Goal',
      count: '85%',
      icon: FireIcon,
      color: 'from-orange-500 to-red-500',
      description: 'Target achieved'
    }
  ];

  const recentActivities = [
    { action: 'Completed session with John Doe', time: '2 hours ago', type: 'success' },
    { action: 'New booking from Jane Smith', time: '4 hours ago', type: 'info' },
    { action: 'Updated availability slots', time: '1 day ago', type: 'warning' },
    { action: 'Received 5-star review', time: '2 days ago', type: 'success' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Welcome back, {user?.name || 'Trainer'}!
          </h1>
          <p className="text-xl text-blue-600 font-medium">
            Ready to inspire and transform lives today?
          </p>
        </motion.div>

        {/* Stats Cards Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {sampleStatsData.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <StatsCard
                title={stat.title}
                value={stat.value}
                trend={stat.trend}
                icon={stat.icon}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-blue-200/30 hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} shadow-lg`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {action.count}
                </span>
              </div>
              <h3 className="text-lg font-bold text-blue-900 mb-1">{action.title}</h3>
              <p className="text-sm text-blue-600">{action.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Chart Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Weekly Chart */}
          <div className="lg:col-span-2">
            <WeeklyChart
              attendanceData={sampleChartData.attendanceData}
              busyData={sampleChartData.busyData}
            />
          </div>

          {/* Recent Activities */}
          <div className="bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-blue-200/30">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Recent Activities
            </h3>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start space-x-3 p-3 rounded-lg bg-white/60 backdrop-blur-sm border border-blue-100/50"
                >
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'info' ? 'bg-blue-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">{activity.action}</p>
                    <p className="text-xs text-blue-600">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-blue-200/30">
            <h3 className="text-xl font-bold text-blue-900 mb-4">This Week</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Sessions</span>
                <span className="font-bold text-blue-900">{dashboardStats?.totalSessions || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Hours</span>
                <span className="font-bold text-blue-900">{dashboardStats?.busyHoursWeek || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Attendance</span>
                <span className="font-bold text-blue-900">{dashboardStats?.attendancePercentage || 94}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-blue-200/30">
            <h3 className="text-xl font-bold text-blue-900 mb-4">Monthly Goal</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Target</span>
                <span className="font-bold text-blue-900">100 sessions</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Achieved</span>
                <span className="font-bold text-blue-900">78 sessions</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
              <p className="text-sm text-blue-600 text-center">78% Complete</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-blue-200/30">
            <h3 className="text-xl font-bold text-blue-900 mb-4">Client Feedback</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Average Rating</span>
                <span className="font-bold text-blue-900">4.8/5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Reviews</span>
                <span className="font-bold text-blue-900">156</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Satisfaction</span>
                <span className="font-bold text-blue-900">96%</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

DashboardOverview.propTypes = {
  user: PropTypes.object.isRequired,
  sessions: PropTypes.array,
  dashboardStats: PropTypes.object,
  calendarEvents: PropTypes.array,
};

export default DashboardOverview;
