// client/src/TrainerDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/calendarStyles.css';  // ✅ Correct
import Modal from 'react-modal';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
import './styles/dashboardStyles.css';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

function ProfileModal({ isOpen, onClose, onSave, userData }) {
  const [form, setForm] = useState(userData || { name: '', email: '', password: '' });
  useEffect(() => { setForm(userData || { name: '', email: '', password: '' }); }, [userData, isOpen]);
  if (!isOpen) return null;
  const handleChange = e => { const { name, value } = e.target; setForm(f => ({ ...f, [name]: value })); };
  const handleSubmit = e => { e.preventDefault(); onSave(form); };
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} ariaHideApp={false} className="modal" overlayClassName="modal-overlay">
      <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full border p-2 rounded" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full border p-2 rounded" required type="email" />
        <input name="password" value={form.password} onChange={handleChange} placeholder="New Password (leave blank to keep current)" className="w-full border p-2 rounded" type="password" minLength={0} />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
          <button type="submit" className="bg-indigo-500 text-white px-4 py-2 rounded">Save</button>
        </div>
      </form>
    </Modal>
  );
}

function BusySlotModal({ isOpen, onClose, onSave }) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => { setStart(''); setEnd(''); setReason(''); setError(''); setLoading(false); }, [isOpen]);
  if (!isOpen) return null;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!start || !end) {
      setError('Start and end time are required.');
      return;
    }
    if (new Date(end) <= new Date(start)) {
      setError('End time must be after start time.');
      return;
    }
    setLoading(true);
    try {
      await onSave({ start, end, reason });
    } catch (err) {
      setError(err.message || 'Failed to add busy slot');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} ariaHideApp={false} className="modal" overlayClassName="modal-overlay">
      <h2 className="text-xl font-bold mb-4">Add Busy Slot</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} className="w-full border p-2 rounded" required />
        <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} className="w-full border p-2 rounded" required />
        <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason (optional)" className="w-full border p-2 rounded" />
        {error && <div className="text-red-500 text-sm font-semibold">{error}</div>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
          <button type="submit" className="bg-indigo-500 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}

function ScheduleClassModal({ isOpen, onClose, onSave, defaultTrainerId }) {
  const [form, setForm] = useState({ course_name: '', date: '', time: '', location: '', duration: 60 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => { setForm({ course_name: '', date: '', time: '', location: '', duration: 60 }); setError(''); setLoading(false); }, [isOpen]);
  if (!isOpen) return null;
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.course_name || !form.date || !form.time || !form.location || !form.duration) {
      setError('All fields are required.');
      return;
    }
    if (isNaN(form.duration) || form.duration <= 0) {
      setError('Duration must be a positive number.');
      return;
    }
    setLoading(true);
    try {
      await onSave({ ...form, trainer_id: defaultTrainerId });
    } catch (err) {
      setError(err.message || 'Failed to schedule class');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} ariaHideApp={false} className="modal" overlayClassName="modal-overlay">
      <h2 className="text-xl font-bold mb-4">Schedule Class</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="course_name" value={form.course_name} onChange={handleChange} placeholder="Course Name" className="w-full border p-2 rounded" required />
        <input name="date" type="date" value={form.date} onChange={handleChange} className="w-full border p-2 rounded" required />
        <input name="time" type="time" value={form.time} onChange={handleChange} className="w-full border p-2 rounded" required />
        <input name="location" value={form.location} onChange={handleChange} placeholder="Location" className="w-full border p-2 rounded" required />
        <input name="duration" type="number" min="1" value={form.duration} onChange={handleChange} className="w-full border p-2 rounded" required />
        {error && <div className="text-red-500 text-sm font-semibold">{error}</div>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
          <button type="submit" className="bg-indigo-500 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}

function TrainerDashboard({ user, onLogout }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({ name: user.name || '', email: user.email || '', password: '' });
  const [busyStatus, setBusyStatus] = useState(() => {
    // Default: available, but persist in localStorage
    const stored = localStorage.getItem('busyStatus');
    return stored ? JSON.parse(stored) : { today: false };
  });
  const [busySlots, setBusySlots] = useState([]);
  const [busyModalOpen, setBusyModalOpen] = useState(false);
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Make fetchSessions available for refresh
  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        toast.error('No authentication token found. Please log in again.');
        setLoading(false);
        return;
      }
      const res = await axios.get('/api/sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const filtered = res.data.filter((s) => s.trainer_id === user.id);
      const mapped = filtered.map((s) => ({
        id: s.id,
        title: `${s.course_name} (${s.location})`,
        start: `${s.date}T${s.time}`,
        course: s.course_name,
        date: s.date,
        time: s.time,
        location: s.location,
        color: s.attended ? '#4caf50' : '#3f51b5',
        extendedProps: { attended: s.attended, approval_status: s.approval_status, created_by_trainer: s.created_by_trainer }
      }));
      setEvents(mapped);
      const attendanceMap = Object.fromEntries(
        filtered.map((s) => [s.id, s.attended])
      );
      setAttendance(attendanceMap);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      let message = 'Failed to load sessions';
      if (err.response && err.response.data && err.response.data.error) {
        message += `: ${err.response.data.error}`;
      }
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Replace useEffect for fetching sessions to use fetchSessions
  useEffect(() => {
    fetchSessions();
  }, [user]);

  useEffect(() => {
    const now = new Date();
    const reminderWindow = new Date(now.getTime() + 30 * 60 * 1000); // next 30 minutes
    const upcomingSessions = events.filter(event => {
      const sessionTime = new Date(event.start);
      return sessionTime > now && sessionTime <= reminderWindow;
    });
    if (upcomingSessions.length > 0) {
      toast.info(`You have ${upcomingSessions.length} session(s) starting soon.`);
    }
  }, [events]);

  const toggleAttendance = async (sessionId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(`http://localhost:5000/api/sessions/${sessionId}/attendance`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendance((prev) => ({ ...prev, [sessionId]: !prev[sessionId] }));
      toast.success('Attendance status updated');
    } catch (err) {
      console.error('Failed to update attendance', err);
      toast.error('Could not update attendance');
    }
  };

  const exportCSV = () => {
    const csv = Papa.unparse(events.map(e => ({
      Course: e.course,
      Date: e.date,
      Time: e.time,
      Location: e.location,
      Attendance: attendance[e.id] ? 'Attended' : 'Not Attended'
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'trainer_sessions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Trainer Sessions', 14, 16);
    doc.autoTable({
      startY: 20,
      head: [['Course', 'Date', 'Time', 'Location', 'Attendance']],
      body: events.map(e => [
        e.course,
        e.date,
        e.time,
        e.location,
        attendance[e.id] ? 'Attended' : 'Not Attended'
      ])
    });
    doc.save('trainer_sessions.pdf');
  };

  const totalSessions = events.length;
  const attendedSessions = Object.values(attendance).filter(Boolean).length;
  const attendancePercentage = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0;

  // Calculate busy hours
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const busyEventsToday = events.filter(e => e.date === todayStr);
  const busyEventsWeek = events.filter(e => {
    const d = new Date(e.date);
    return d >= weekStart && d <= weekEnd;
  });
  const busyHoursToday = busyEventsToday.reduce((sum, e) => sum + 1, 0); // 1 hour per event
  const busyHoursWeek = busyEventsWeek.reduce((sum, e) => sum + 1, 0);

  // Busy toggle handler
  const handleBusyToggle = () => {
    const newStatus = { ...busyStatus, today: !busyStatus.today };
    setBusyStatus(newStatus);
    localStorage.setItem('busyStatus', JSON.stringify(newStatus));
  };

  // Calendar event styling: highlight busy slots
  const eventContent = (arg) => {
    const isBusy = true; // All events are busy slots
    return (
      <div style={{
        background: isBusy ? 'linear-gradient(90deg,#f87171 0%,#fbbf24 100%)' : '#4caf50',
        color: '#fff',
        borderRadius: 8,
        padding: 4,
        fontWeight: 600,
        boxShadow: isBusy ? '0 2px 8px #fbbf2440' : undefined
      }}>
        {arg.event.title}
      </div>
    );
  };

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedEvents = filteredEvents.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalPages = Math.ceil(filteredEvents.length / rowsPerPage);

  const handleSaveProfile = async (form) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/profile', form, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Profile updated successfully');
      setProfileModalOpen(false);
      setProfileData({ ...profileData, ...form, password: '' });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  // Fetch busy slots
  useEffect(() => {
    const fetchBusySlots = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/busy-slots', { headers: { Authorization: `Bearer ${token}` } });
        setBusySlots(res.data);
      } catch (err) {
        toast.error('Failed to load busy slots');
      }
    };
    fetchBusySlots();
  }, [user]);

  // Add busy slot
  const handleAddBusySlot = async ({ start, end, reason }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/busy-slots', { start_time: start, end_time: end, reason }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Busy slot added');
      setBusyModalOpen(false);
      setNotifications(n => [...n, { type: 'busy', message: 'Busy slot added.' }]);
      // Refresh busy slots
      const res = await axios.get('/api/busy-slots', { headers: { Authorization: `Bearer ${token}` } });
      setBusySlots(res.data);
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to add busy slot');
    }
  };
  // Remove busy slot
  const handleRemoveBusySlot = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/busy-slots/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Busy slot removed');
      setNotifications(n => [...n, { type: 'busy', message: 'Busy slot removed.' }]);
      setBusySlots(busySlots.filter(b => b.id !== id));
    } catch (err) {
      toast.error('Failed to remove busy slot');
    }
  };
  // Schedule class
  const handleScheduleClass = async (form) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/sessions', { ...form, created_by_trainer: true }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Class scheduled (pending approval)');
      setClassModalOpen(false);
      setNotifications(n => [...n, { type: 'session', message: 'Class scheduled.' }]);
      // Refresh sessions so the new class appears in the calendar
      fetchSessions();
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to schedule class');
    }
  };

  // Merge events and busy slots for calendar
  const calendarEvents = [
    ...events.map(e => ({
      ...e,
      color: e.extendedProps?.approval_status === 'pending' ? '#fbbf24' : (e.extendedProps?.approval_status === 'rejected' ? '#f87171' : '#4caf50'),
      title: `${e.title} (${e.extendedProps?.approval_status || 'approved'})\n${e.date} ${e.time}`,
      type: 'session',
    })),
    ...busySlots.map(b => ({
      id: `busy-${b.id}`,
      title: b.reason ? `Busy: ${b.reason}` : 'Busy',
      start: b.start_time,
      end: b.end_time,
      color: '#f87171',
      type: 'busy',
    }))
  ];

  // Analytics data
  const analyticsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sessions',
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: '#6366f1',
      },
      {
        label: 'Busy Slots',
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: '#f87171',
      }
    ]
  };
  events.forEach(e => {
    const d = new Date(e.date);
    analyticsData.datasets[0].data[d.getDay()]++;
  });
  busySlots.forEach(b => {
    const d = new Date(b.start_time);
    analyticsData.datasets[1].data[d.getDay()]++;
  });

  function getTodayAndUpcomingSessions(events) {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const upcomingLimit = new Date(today);
    upcomingLimit.setDate(today.getDate() + 7);
    const todaySessions = events.filter(e => e.date === todayStr);
    const upcomingSessions = events.filter(e => {
      const d = new Date(e.date);
      return d > today && d <= upcomingLimit;
    });
    return { todaySessions, upcomingSessions };
  }

  const { todaySessions, upcomingSessions } = getTodayAndUpcomingSessions(events);

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

  return (
    <div className="dashboard-bg">
      <div className="dashboard-container">
        <ToastContainer />
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="dashboard-card" style={{ background: 'rgba(236,239,255,0.7)', marginBottom: 16 }}>
            <h3 className="dashboard-section-title">Notifications</h3>
            <ul>
              {notifications.slice(-5).reverse().map((n, i) => (
                <li key={i} style={{ color: n.type === 'busy' ? '#f87171' : '#6366f1', fontWeight: 600 }}>{n.message}</li>
              ))}
            </ul>
          </div>
        )}
        {/* 50x Modern UI: Animated glassmorphism cards, beautiful gradients, elegant badges */}
        <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.85)', boxShadow: '0 8px 32px 0 rgba(80,112,255,0.18)', border: '2px solid #a5b4fc', marginBottom: 32, animation: 'fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32 }}>
            <div>
              <h2 className="dashboard-header" style={{ fontSize: '2.7rem', background: 'linear-gradient(90deg,#6366f1 0%,#a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Welcome, {user.email}</h2>
              <p className="text-sm" style={{ color: '#6366f1', fontWeight: 600 }}>Trainer Dashboard</p>
              <p className="mt-2 font-semibold" style={{ color: '#6366f1' }}>Attendance: {attendancePercentage}%</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button className="dashboard-btn bg-red-500" style={{ marginBottom: 12, fontWeight: 700, fontSize: '1.1rem' }} onClick={onLogout}>Logout</button>
              <div style={{ marginBottom: 10 }}>
                <span className={`dashboard-btn ${busyStatus.today ? 'bg-red-500' : 'bg-green-500'}`} style={{ minWidth: 120, fontWeight: 700, fontSize: '1.1rem' }} onClick={handleBusyToggle}>
                  {busyStatus.today ? 'Busy Today' : 'Available Today'}
                </span>
              </div>
              <div style={{ fontWeight: 600, color: '#5b21b6' }}>
                Busy hours today: <span style={{ color: '#f59e42' }}>{busyHoursToday}</span><br />
                Busy hours this week: <span style={{ color: '#f87171' }}>{busyHoursWeek}</span>
              </div>
              <div style={{ marginTop: 10 }}>
                <button className="dashboard-btn" onClick={() => setBusyModalOpen(true)}>Add Busy Slot</button>
                <button className="dashboard-btn" onClick={() => setClassModalOpen(true)}>Schedule Class</button>
              </div>
            </div>
          </div>
        </div>
        {/* Today's Sessions */}
        <div className="dashboard-card" style={{ background: 'rgba(236,239,255,0.9)', border: '2px solid #6366f1', marginBottom: 24, animation: 'fadeInUp 0.9s cubic-bezier(0.23, 1, 0.32, 1)' }}>
          <h3 className="dashboard-section-title" style={{ background: 'linear-gradient(90deg,#6366f1 0%,#a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Today's Sessions</h3>
          {todaySessions.length === 0 ? <p style={{ color: '#888' }}>No sessions today.</p> : (
            <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {todaySessions.map(s => (
                <li key={s.id} style={{ background: 'linear-gradient(90deg,#a5b4fc 0%,#6366f1 100%)', color: '#fff', borderRadius: 12, padding: '10px 18px', fontWeight: 600, boxShadow: '0 2px 8px #6366f140', minWidth: 180 }}>
                  {s.course} <span style={{ fontWeight: 400, fontSize: 13 }}>({s.time})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Upcoming Sessions */}
        <div className="dashboard-card" style={{ background: 'rgba(236,239,255,0.9)', border: '2px solid #6366f1', marginBottom: 24, animation: 'fadeInUp 1s cubic-bezier(0.23, 1, 0.32, 1)' }}>
          <h3 className="dashboard-section-title" style={{ background: 'linear-gradient(90deg,#6366f1 0%,#a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Upcoming Sessions (Next 7 Days)</h3>
          {upcomingSessions.length === 0 ? <p style={{ color: '#888' }}>No upcoming sessions.</p> : (
            <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {upcomingSessions.map(s => (
                <li key={s.id} style={{ background: 'linear-gradient(90deg,#6366f1 0%,#a5b4fc 100%)', color: '#fff', borderRadius: 12, padding: '10px 18px', fontWeight: 600, boxShadow: '0 2px 8px #6366f140', minWidth: 180 }}>
                  {s.course} <span style={{ fontWeight: 400, fontSize: 13 }}>({s.date} {s.time})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Busy Slot List */}
        <div className="dashboard-card">
          <h3 className="dashboard-section-title">Your Busy Slots</h3>
          <ul>
            {busySlots.map(b => (
              <li key={b.id} style={{ marginBottom: 8 }}>
                <span style={{ color: '#f87171', fontWeight: 600 }}>{b.reason || 'Busy'}</span> &mdash; {new Date(b.start_time).toLocaleString()} to {new Date(b.end_time).toLocaleString()}
                <button className="dashboard-btn bg-red-500" style={{ marginLeft: 12 }} onClick={() => handleRemoveBusySlot(b.id)}>Remove</button>
              </li>
            ))}
            {busySlots.length === 0 && <li>No busy slots</li>}
          </ul>
        </div>
        {/* Analytics */}
        <div className="dashboard-card">
          <h3 className="dashboard-section-title">Analytics</h3>
          <Bar data={analyticsData} />
        </div>
        <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} onSave={handleSaveProfile} userData={profileData} />
        <BusySlotModal isOpen={busyModalOpen} onClose={() => setBusyModalOpen(false)} onSave={handleAddBusySlot} />
        <ScheduleClassModal isOpen={classModalOpen} onClose={() => setClassModalOpen(false)} onSave={handleScheduleClass} defaultTrainerId={user.id} />
        <div className="dashboard-card">
          <h3 className="dashboard-section-title">Your Timetable</h3>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
            initialView="timeGridWeek"
            events={calendarEvents}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,listWeek'
            }}
            eventContent={arg => (
              <div style={{
                background: arg.event.extendedProps?.type === 'busy' ? 'linear-gradient(90deg,#f87171 0%,#fbbf24 100%)' : (arg.event.extendedProps?.approval_status === 'pending' ? '#fbbf24' : (arg.event.extendedProps?.approval_status === 'rejected' ? '#f87171' : '#4caf50')),
                color: '#fff',
                borderRadius: 8,
                padding: 4,
                fontWeight: 600,
                boxShadow: '0 2px 8px #fbbf2440',
                border: (new Date(arg.event.start).toDateString() === new Date().toDateString()) ? '2.5px solid #6366f1' : '',
                outline: (new Date(arg.event.start) > new Date() && new Date(arg.event.start) <= new Date(Date.now() + 7*24*60*60*1000)) ? '2.5px dashed #a5b4fc' : ''
              }}>
                {arg.event.title}
              </div>
            )}
          />
        </div>
        <div className="dashboard-card">
          <h3 className="dashboard-section-title">Session List</h3>
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4 px-3 py-2 border rounded w-full"
          />
          <div className="overflow-x-auto">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Location</th>
                  <th>Attendance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEvents.map((event) => (
                  <tr key={event.id}>
                    <td>{event.course}</td>
                    <td>{event.date}</td>
                    <td>{event.time}</td>
                    <td>{event.location}</td>
                    <td>{attendance[event.id] ? 'Attended' : 'Not Attended'}</td>
                    <td>{event.extendedProps?.approval_status || 'approved'}</td>
                    <td>
                      <span style={{ fontWeight: 500, color: '#6366f1' }}>
                        {event.extendedProps?.created_by_trainer ? `Scheduled: ${event.date} ${event.time}` : ''}
                      </span>
                      <button onClick={() => toggleAttendance(event.id)} className="dashboard-btn" style={{ marginLeft: 8 }}>
                        Toggle Attendance
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination, Export Buttons, etc. can be styled similarly */}
        </div>
      </div>
    </div>
  );
}

export default TrainerDashboard;