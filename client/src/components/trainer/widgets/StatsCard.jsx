import React from 'react';
import PropTypes from 'prop-types';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

// StatsCard component
const StatsCard = ({ title, value, trend, icon: Icon }) => {
  const trendIcon = trend > 0 ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend > 0 ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full flex items-center justify-between border border-blue-200/30 hover:shadow-3xl hover:scale-105 transition-all duration-500 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl" />
      
      <div className="flex items-center relative z-10">
        {Icon && (
          <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mr-6">
            <Icon className="w-12 h-12 text-white" />
          </div>
        )}
        <div>
          <h4 className="text-xl font-bold text-blue-900 mb-2">{title}</h4>
          <p className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{value}</p>
        </div>
      </div>
      
      <div className={`flex items-center ${trendColor} bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md`}>
        {React.createElement(trendIcon, { className: 'w-6 h-6' })}
        <p className="ml-2 text-xl font-bold">{trend}%</p>
      </div>
    </div>
  );
};

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  trend: PropTypes.number.isRequired,
  icon: PropTypes.elementType,
};

export default StatsCard;

