// client/src/api.js
// Re-export everything from the consolidated services
export {
  apiClient,
  authService,
  sessionService,
  userService,
  notificationService,
  busySlotService,
  apiService,
} from './api/services.js';

// Export the canonical axios instance as the default export
export { apiClient as default } from './api/services.js';
