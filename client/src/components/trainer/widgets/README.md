# Stats Widgets Implementation

This directory contains the implementation of stats widgets with visual hierarchy for the Trainer Dashboard.

## Components

### 1. StatsCard.jsx
A reusable card component with glassmorphism effect that displays:
- **Title**: The metric name
- **Value**: The current value (number or string)
- **Trend**: Percentage change with up/down arrow indicator
- **Icon**: Customizable icon slot

#### Features:
- Glassmorphism effect with `bg-white/20 backdrop-blur-md`
- Trend indicators with green (positive) or red (negative) colors
- Flexible icon integration using Heroicons
- Responsive design

#### Usage:
```jsx
import StatsCard from './StatsCard';
import { CalendarIcon } from '@heroicons/react/24/outline';

<StatsCard
  title="Total Sessions"
  value="24"
  trend={12}
  icon={CalendarIcon}
/>
```

### 2. WeeklyChart.jsx
A Chart.js-based component for visualizing weekly data:
- **Attendance Data**: Blue bars representing attendance
- **Busy Slots**: Red bars representing busy time slots
- **Responsive**: Adapts to container size

#### Features:
- Built with Chart.js and react-chartjs-2
- Glassmorphism backdrop for consistency
- Customizable colors and labels
- Responsive design with `maintainAspectRatio: false`

#### Usage:
```jsx
import WeeklyChart from './WeeklyChart';

<WeeklyChart
  attendanceData={[12, 19, 3, 5, 2, 3, 9]}
  busyData={[2, 3, 20, 5, 1, 4, 8]}
/>
```

### 3. StatsWidgets.jsx
A comprehensive layout component that combines multiple widgets:
- **Stats Cards Grid**: 4-column responsive grid for stats cards
- **Chart Section**: Full-width chart display
- **Additional Stats**: 3-column grid for supplementary information

#### Features:
- Multiple responsive grid layouts
- Graceful collapse on small screens
- Default data for easy testing
- Consistent glassmorphism styling

#### Usage:
```jsx
import StatsWidgets from './StatsWidgets';

<StatsWidgets
  statsData={customStatsData}
  chartData={customChartData}
/>
```

## Grid Layout Responsiveness

The implementation uses Tailwind CSS classes for responsive design:

### Stats Cards Grid
- **Mobile** (default): `grid-cols-1` - Single column
- **Small screens** (sm): `grid-cols-2` - Two columns
- **Large screens** (lg): `grid-cols-4` - Four columns

### Chart Section
- **Mobile** (default): `grid-cols-1` - Single column
- **Large screens** (lg): `grid-cols-2` with `lg:col-span-2` - Full width

### Additional Stats
- **Mobile** (default): `grid-cols-1` - Single column
- **Medium screens** (md): `grid-cols-2` - Two columns
- **Extra large screens** (xl): `grid-cols-3` - Three columns

## Styling Features

### Glassmorphism Effect
All components use consistent glassmorphism styling:
```css
bg-white/20 backdrop-blur-md rounded-xl shadow-lg
```

### Color Scheme
- **Primary**: Blue tones for main elements
- **Success**: Green for positive trends
- **Warning**: Red for negative trends
- **Text**: Gray scale for readability

## Dependencies

The implementation requires:
- React 18+
- Chart.js 4+
- react-chartjs-2 5+
- @heroicons/react 2+
- Tailwind CSS 3+
- PropTypes for type checking

## File Structure

```
widgets/
├── StatsCard.jsx           # Individual stat card component
├── WeeklyChart.jsx         # Chart.js weekly visualization
├── StatsWidgets.jsx        # Main layout component
├── StatsWidgetsExample.jsx # Usage example
├── README.md              # This documentation
└── index.js               # Export barrel file
```

## Integration

To use these components in your dashboard:

1. Import the components:
```jsx
import { StatsWidgets } from './components/trainer/widgets';
```

2. Prepare your data:
```jsx
const statsData = [
  { title: 'Sessions', value: '24', trend: 12, icon: CalendarIcon },
  // ... more stats
];

const chartData = {
  attendanceData: [12, 19, 3, 5, 2, 3, 9],
  busyData: [2, 3, 20, 5, 1, 4, 8],
};
```

3. Render the component:
```jsx
<StatsWidgets statsData={statsData} chartData={chartData} />
```

## Customization

### Adding New Stats
To add new stat cards, extend the `statsData` array with objects containing:
- `title`: Display name
- `value`: Current value
- `trend`: Percentage change
- `icon`: Heroicon component

### Modifying Charts
The `WeeklyChart` component can be customized by:
- Updating the `chartOptions` object
- Changing colors in the `datasets` array
- Modifying labels and styling

### Responsive Breakpoints
Grid layouts can be adjusted by modifying Tailwind classes:
- `sm:` - 640px and up
- `md:` - 768px and up
- `lg:` - 1024px and up
- `xl:` - 1280px and up
