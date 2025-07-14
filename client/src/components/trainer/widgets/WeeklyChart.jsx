import React from 'react';
import PropTypes from 'prop-types';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// WeeklyChart component
const WeeklyChart = ({ attendanceData, busyData }) => {
  // Days of the week
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Chart data
  const chartData = {
    labels: daysOfWeek,
    datasets: [
      {
        label: 'Attendance',
        data: attendanceData,
        backgroundColor: 'rgba(59, 130, 246, 0.6)', // Blue
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Busy Slots',
        data: busyData,
        backgroundColor: 'rgba(239, 68, 68, 0.6)', // Red
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#374151', // Dark gray text
        },
      },
      title: {
        display: true,
        text: 'Weekly Attendance vs Busy Slots',
        color: '#374151',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#6B7280', // Gray text
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#6B7280',
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
      },
    },
  };

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full border border-blue-200/30 hover:shadow-3xl hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl" />
      
      <div className="relative z-10">
        <div className="mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Weekly Performance Overview
          </h3>
          <p className="text-blue-600 font-medium">Track your sessions and availability</p>
        </div>
        
        <div className="h-80 bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-inner">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

WeeklyChart.propTypes = {
  attendanceData: PropTypes.arrayOf(PropTypes.number).isRequired,
  busyData: PropTypes.arrayOf(PropTypes.number).isRequired,
};

WeeklyChart.defaultProps = {
  attendanceData: [0, 0, 0, 0, 0, 0, 0],
  busyData: [0, 0, 0, 0, 0, 0, 0],
};

export default WeeklyChart;
