import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Generate mock notifications for now
  const generateNotifications = useCallback((sessions) => {
    const now = new Date();
    const upcomingThreshold = 30 * 60 * 1000; // 30 minutes
    const notifications = [];

    // Check for upcoming sessions
    sessions.forEach(session => {
      const sessionTime = new Date(`${session.date}T${session.time}`);
      const timeDiff = sessionTime.getTime() - now.getTime();
      
      if (timeDiff > 0 && timeDiff <= upcomingThreshold) {
        notifications.push({
          id: `session-${session.id}`,
          type: 'upcoming_session',
          title: 'Upcoming Session',
          message: `${session.course_name} starts in ${Math.round(timeDiff / 60000)} minutes`,
          timestamp: now.toISOString(),
          read: false,
          priority: 'high',
          action: {
            label: 'View Session',
            callback: () => console.log('Navigate to session', session.id)
          }
        });
      }
    });

    // Check for pending approvals
    sessions.forEach(session => {
      if (session.approval_status === 'pending' && session.created_by_trainer) {
        notifications.push({
          id: `approval-${session.id}`,
          type: 'pending_approval',
          title: 'Pending Approval',
          message: `Your scheduled class "${session.course_name}" is awaiting approval`,
          timestamp: now.toISOString(),
          read: false,
          priority: 'medium',
          action: {
            label: 'View Details',
            callback: () => console.log('Navigate to session details', session.id)
          }
        });
      }
    });

    return notifications;
  }, []);

  // Show session reminders
  const showSessionReminders = useCallback((sessions) => {
    const now = new Date();
    const reminderThreshold = 30 * 60 * 1000; // 30 minutes

    sessions.forEach(session => {
      const sessionTime = new Date(`${session.date}T${session.time}`);
      const timeDiff = sessionTime.getTime() - now.getTime();
      
      if (timeDiff > 0 && timeDiff <= reminderThreshold) {
        const minutes = Math.round(timeDiff / 60000);
        toast.info(
          `📅 Reminder: ${session.course_name} starts in ${minutes} minutes at ${session.location}`,
          {
            autoClose: 10000,
            closeOnClick: true,
            draggable: true,
            position: "top-center"
          }
        );
      }
    });
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId 
        ? { ...notif, read: true }
        : notif
    ));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  }, []);

  // Clear notification
  const clearNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Update notifications based on sessions
  const updateNotifications = useCallback((sessions) => {
    const newNotifications = generateNotifications(sessions);
    setNotifications(newNotifications);
    
    // Show reminders for upcoming sessions
    showSessionReminders(sessions);
  }, [generateNotifications, showSessionReminders]);

  // Calculate unread count
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Permission-based notifications (if supported)
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  // Send browser notification
  const sendBrowserNotification = useCallback((title, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
  }, []);

  // Send notification for upcoming session
  const notifyUpcomingSession = useCallback((session) => {
    const title = 'Upcoming Session';
    const body = `${session.course_name} starts in 15 minutes at ${session.location}`;
    
    sendBrowserNotification(title, {
      body,
      tag: `session-${session.id}`,
      requireInteraction: true
    });
  }, [sendBrowserNotification]);

  return {
    notifications,
    unreadCount,
    loading,
    updateNotifications,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
    requestNotificationPermission,
    sendBrowserNotification,
    notifyUpcomingSession
  };
};

export default useNotifications;
