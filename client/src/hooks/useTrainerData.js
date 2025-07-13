import { useState, useEffect, useCallback } from 'react';
import { sessionService, busySlotService } from '../api';
import { toast } from 'react-toastify';

const useTrainerData = (trainerId) => {
  const [sessions, setSessions] = useState([]);
  const [busySlots, setBusySlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  // Cache duration in minutes
  const CACHE_DURATION = 5;

  // Check if data is fresh
  const isDataFresh = useCallback(() => {
    if (!lastFetch) return false;
    const timeDiff = Date.now() - lastFetch;
    return timeDiff < CACHE_DURATION * 60 * 1000;
  }, [lastFetch]);

  // Fetch sessions with error handling and retry
  const fetchSessions = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && isDataFresh()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await sessionService.getAllSessions();
      const sessionsData = Array.isArray(response.data) ? response.data : [];
      
      // Filter sessions by trainer if needed (backend should handle this)
      const filteredSessions = sessionsData.filter(session => 
        session.trainer_id === trainerId || session.created_by_trainer
      );
      
      setSessions(filteredSessions);
      setLastFetch(Date.now());
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch sessions';
      setError(errorMessage);
      console.error('Error fetching sessions:', err);
      
      // Show error toast only if not initial load
      if (!loading) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [trainerId, isDataFresh, loading]);

  // Fetch busy slots
  const fetchBusySlots = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && isDataFresh()) {
      return;
    }

    try {
      const response = await busySlotService.getAllBusySlots();
      const slotsData = Array.isArray(response.data) ? response.data : [];
      setBusySlots(slotsData);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch busy slots';
      console.error('Error fetching busy slots:', err);
      
      // Don't show error for busy slots as it's less critical
      setBusySlots([]);
    }
  }, [isDataFresh]);

  // Fetch all data
  const fetchData = useCallback(async (forceRefresh = false) => {
    await Promise.all([
      fetchSessions(forceRefresh),
      fetchBusySlots(forceRefresh)
    ]);
  }, [fetchSessions, fetchBusySlots]);

  // Initial data fetch
  useEffect(() => {
    if (trainerId) {
      fetchData(true);
    }
  }, [trainerId, fetchData]);

  // Refresh sessions
  const refetchSessions = useCallback(() => {
    return fetchSessions(true);
  }, [fetchSessions]);

  // Refresh busy slots
  const refetchBusySlots = useCallback(() => {
    return fetchBusySlots(true);
  }, [fetchBusySlots]);

  // Refresh all data
  const refetchAll = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Update session
  const updateSession = useCallback(async (sessionId, updates) => {
    try {
      await sessionService.updateSession(sessionId, updates);
      
      // Update local state
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, ...updates }
          : session
      ));
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update session';
      throw new Error(errorMessage);
    }
  }, []);

  // Add busy slot
  const addBusySlot = useCallback(async (slotData) => {
    try {
      const response = await busySlotService.createBusySlot({
        ...slotData,
        trainer_id: trainerId
      });
      
      // Add to local state
      setBusySlots(prev => [...prev, response.data]);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to add busy slot';
      throw new Error(errorMessage);
    }
  }, [trainerId]);

  // Schedule class
  const scheduleClass = useCallback(async (classData) => {
    try {
      const response = await sessionService.createSession({
        ...classData,
        trainer_id: trainerId,
        created_by_trainer: true
      });
      
      // Add to local state
      setSessions(prev => [...prev, response.data]);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to schedule class';
      throw new Error(errorMessage);
    }
  }, [trainerId]);

  // Delete session
  const deleteSession = useCallback(async (sessionId) => {
    try {
      await sessionService.deleteSession(sessionId);
      
      // Remove from local state
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete session';
      throw new Error(errorMessage);
    }
  }, []);

  // Delete busy slot
  const deleteBusySlot = useCallback(async (slotId) => {
    try {
      await busySlotService.deleteBusySlot(slotId);
      
      // Remove from local state
      setBusySlots(prev => prev.filter(slot => slot.id !== slotId));
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete busy slot';
      throw new Error(errorMessage);
    }
  }, []);

  // Update attendance
  const updateAttendance = useCallback(async (sessionId) => {
    try {
      await sessionService.updateAttendance(sessionId);
      
      // Update local state
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, attended: !session.attended }
          : session
      ));
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update attendance';
      throw new Error(errorMessage);
    }
  }, []);

  return {
    sessions,
    busySlots,
    loading,
    error,
    isDataFresh: isDataFresh(),
    refetchSessions,
    refetchBusySlots,
    refetchAll,
    updateSession,
    addBusySlot,
    scheduleClass,
    deleteSession,
    deleteBusySlot,
    updateAttendance
  };
};

export default useTrainerData;
