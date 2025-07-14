/**
 * Layout Components Barrel File
 * 
 * This file exports all layout components for the trainer module.
 * Layout components handle the overall structure and positioning of views.
 * 
 * Component Hierarchy: Navigation → ViewContainer → View → Widgets
 */

// Navigation Components
export { default as Sidebar } from './Sidebar';
export { default as MobileHeader } from './MobileHeader';
export { default as SidebarOverlay } from './SidebarOverlay';

// View Container Components
// export { default as ViewContainer } from './ViewContainer';
// export { default as MainLayout } from './MainLayout';
// export { default as ContentWrapper } from './ContentWrapper';

// Layout Utilities
// export { default as LayoutProvider } from './LayoutProvider';
// export { default as LayoutConfig } from './LayoutConfig';

// Layout components collection
export const layoutComponents = {
  Sidebar,
  MobileHeader,
  SidebarOverlay,
};
