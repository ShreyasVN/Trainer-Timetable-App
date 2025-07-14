/**
 * Trainer Module Barrel File
 * 
 * This is the main entry point for the trainer module components.
 * It exports all components, hooks, types, and utilities from the trainer module.
 * 
 * Component Hierarchy: Navigation ➔ ViewContainer ➔ View ➔ Widgets
 */

// Re-export all sub-modules
export * from './layout';
export * from './views';
export * from './widgets';
export * from './modals';
export * from './hooks';
export * from './types';

// Main Dashboard Component (existing)
export { default as TrainerDashboard } from './TrainerDashboard';

// Module configuration
export const trainerModuleConfig = {
  name: 'trainer',
  version: '1.0.0',
  description: 'Trainer module containing all trainer-related components and functionality',
  hierarchy: [
    'Navigation',
    'ViewContainer', 
    'View',
    'Widgets'
  ],
  folders: [
    'layout',
    'views', 
    'widgets',
    'modals',
    'hooks',
    'types'
  ]
};
