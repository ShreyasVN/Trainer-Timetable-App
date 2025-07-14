/**
 * Widgets Components Barrel File
 * 
 * This file exports all widget components for the trainer module.
 * Widgets are reusable UI components that are used within views.
 * 
 * Component Hierarchy: Navigation ➔ ViewContainer ➔ View ➔ Widgets
 */

// Dashboard Widgets
export { default as StatsCard } from './StatsCard';
export { default as StatsWidgets } from './StatsWidgets';
// export { default as ScheduleWidget } from './ScheduleWidget';
// export { default as UpcomingSessionsWidget } from './UpcomingSessionsWidget';
// export { default as UtilizationWidget } from './UtilizationWidget';

// Calendar Widgets
// export { default as CalendarWidget } from './CalendarWidget';
// export { default as TimeSlotWidget } from './TimeSlotWidget';
// export { default as AvailabilityWidget } from './AvailabilityWidget';

// Session Widgets
// export { default as SessionCard } from './SessionCard';
// export { default as SessionList } from './SessionList';
// export { default as SessionFilter } from './SessionFilter';

// Chart Widgets
export { default as WeeklyChart } from './WeeklyChart';
// export { default as UtilizationChart } from './UtilizationChart';
// export { default as PerformanceChart } from './PerformanceChart';
// export { default as TrendChart } from './TrendChart';

// Form Widgets
// export { default as SessionForm } from './SessionForm';
// export { default as TimeSlotForm } from './TimeSlotForm';
// export { default as AvailabilityForm } from './AvailabilityForm';

// Placeholder exports - uncomment above as components are created
export const widgetComponents = {
  // Dashboard widgets will be exported here
  // Calendar widgets will be exported here
  // Session widgets will be exported here
  // Chart widgets will be exported here
  // Form widgets will be exported here
};
