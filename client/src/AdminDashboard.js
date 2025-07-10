// client/src/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ReactPaginate from 'react-paginate';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Papa from 'papaparse';
import TrainerUtilization from './TrainerUtilization';
import Modal from 'react-modal';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import * as XLSX from 'xlsx';

import './styles/calendarStyles.css';
import './styles/dashboardStyles.css';

function SessionModal({ isOpen, onClose, onSave, sessionData, trainers }) {
  const [formData, setFormData] = useState(sessionData || {
    trainer_id: '', course_name: '', date: '', time: '', location: '', duration: '', attended: false, emailNotify: true
  });

  useEffect(() => {
    if (sessionData) {
      setFormData(sessionData);
    } else {
      setFormData({ trainer_id: '', course_name: '', date: '', time: '', location: '', duration: '', attended: false, emailNotify: true });
    }
  }, [sessionData, isOpen]);

  if (!isOpen) return null;

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!formData.duration || isNaN(formData.duration) || formData.duration <= 0) {
      toast.error('Please enter a valid session duration.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{sessionData ? 'Edit Session' : 'Add Session'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <select name="trainer_id" value={formData.trainer_id} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="">Select Trainer</option>
            {trainers.map(t => <option key={t.id} value={t.id}>{t.email}</option>)}
          </select>
          <input name="course_name" value={formData.course_name} onChange={handleChange} placeholder="Course Name" className="w-full border p-2 rounded" />
          <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full border p-2 rounded" />
          <input type="time" name="time" value={formData.time} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="location" value={formData.location} onChange={handleChange} placeholder="Location" className="w-full border p-2 rounded" />
          <input name="duration" type="number" min="1" placeholder="Duration (minutes)" value={formData.duration} onChange={handleChange} className="w-full border p-2 rounded" />
          <label className="inline-flex items-center">
            <input type="checkbox" name="attended" checked={formData.attended} onChange={handleChange} className="mr-2" />
            Mark as Attended
          </label>
          <label className="inline-flex items-center">
            <input type="checkbox" name="emailNotify" checked={formData.emailNotify} onChange={handleChange} className="mr-2" />
            Send Email Notification
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            <button type="submit" className="bg-indigo-500 text-white px-4 py-2 rounded">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UserModal({ isOpen, onClose, onSave, userData }) {
  const [form, setForm] = useState(userData || { name: '', email: '', password: '', role: 'trainer' });
  useEffect(() => { setForm(userData || { name: '', email: '', password: '', role: 'trainer' }); }, [userData, isOpen]);
  if (!isOpen) return null;
  const handleChange = e => { const { name, value } = e.target; setForm(f => ({ ...f, [name]: value })); };
  const handleSubmit = e => { e.preventDefault(); onSave(form); };
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} ariaHideApp={false} className="modal" overlayClassName="modal-overlay">
      <h2 className="text-xl font-bold mb-4">{userData ? 'Edit User' : 'Add User'}</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full border p-2 rounded" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full border p-2 rounded" required type="email" />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Password" className="w-full border p-2 rounded" type="password" minLength={userData ? 0 : 6} />
        <select name="role" value={form.role} onChange={handleChange} className="w-full border p-2 rounded">
          <option value="trainer">Trainer</option>
          <option value="admin">Admin</option>
        </select>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
          <button type="submit" className="bg-indigo-500 text-white px-4 py-2 rounded">Save</button>
        </div>
      </form>
    </Modal>
  );
}

function sendEmailNotification(session) {
  const token = localStorage.getItem('token');
  axios.post('/api/notifications/email', {
    subject: 'New Session Scheduled',
    message: `You have a new session: ${session.course_name} on ${session.date} at ${session.time}`,
    recipient: session.trainer_email
  }, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(() => {
    toast.success('Email notification sent');
  }).catch(() => {
    toast.error('Failed to send email');
  });
}

function getTodayAndUpcomingSessions(sessions) {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const upcomingLimit = new Date(today);
  upcomingLimit.setDate(today.getDate() + 7);
  const todaySessions = sessions.filter(s => s.date === todayStr);
  const upcomingSessions = sessions.filter(s => {
    const d = new Date(s.date);
    return d > today && d <= upcomingLimit;
  });
  return { todaySessions, upcomingSessions };
}

import PropTypes from 'prop-types';
function AdminDashboard({ user, onLogout }) {
  const [sessions, setSessions] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const itemsPerPage = 10;
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarSource, setCalendarSource] = useState('backend'); // 'backend' or 'excel'
  const [excelFileName, setExcelFileName] = useState('');
  const localizer = momentLocalizer(moment);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
fetchData();

AdminDashboard.propTypes = {
    user: PropTypes.shape({
        email: PropTypes.string.isRequired,
        role: PropTypes.string.isRequired
    }).isRequired,
    onLogout: PropTypes.func.isRequired
};

SessionModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    sessionData: PropTypes.object,
    trainers: PropTypes.array.isRequired
};
  }, []);

  useEffect(() => {
    if (calendarSource === 'backend') {
      setCalendarEvents(sessions.map(session => ({
        id: session.id,
        title: `${session.course_name} (${session.location}) - ${trainers.find(t => t.id === session.trainer_id)?.email || 'Unknown'}`,
        start: new Date(`${session.date}T${session.time}`),
        end: new Date(new Date(`${session.date}T${session.time}`).getTime() + ((session.duration || 60) * 60000)),
        allDay: false,
        resource: session
      })));
    }
  }, [sessions, trainers, calendarSource]);

  // Fetch notifications for admin
  useEffect(() => {
    if (user.role === 'admin') {
      const fetchNotifications = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
          setNotifications(res.data);
        } catch (err) {
          // ignore
        }
      };
      fetchNotifications();
    }
  }, [user]);

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setExcelFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      // Assume first row is header
      const header = json[0];
      const rows = json.slice(1);
      // Map Excel columns to event fields
      const events = rows.map((row, idx) => {
        const get = (col) => row[header.indexOf(col)] || '';
        const date = get('Date') || get('Session Date') || get('session_date') || get('date');
        const time = get('Time') || get('Session Time') || get('session_time') || get('time') || '09:00';
        const duration = parseInt(get('Duration') || 60);
        return {
          id: idx + 10000, // avoid collision with backend ids
          title: `${get('Course') || get('Course Name') || get('course_name')} (${get('Location') || get('location')}) - ${get('Trainer') || get('trainer_email')}`,
          start: new Date(`${date}T${time}`),
          end: new Date(new Date(`${date}T${time}`).getTime() + (duration * 60000)),
          allDay: false,
          resource: row
        };
      });
      setCalendarEvents(events);
      setCalendarSource('excel');
    };
    reader.readAsArrayBuffer(file);
  };

  const handleCalendarSourceChange = (src) => {
    setCalendarSource(src);
    if (src === 'backend') setExcelFileName('');
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [sessionsRes, trainersRes, usersRes] = await Promise.all([
        axios.get('/api/sessions', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/users', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/users', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setSessions(sessionsRes.data);
      setTrainers(trainersRes.data.filter(t => t.role === 'trainer'));
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSession = async (sessionData) => {
    try {
      const token = localStorage.getItem('token');
      if (editingSession) {
        await axios.put(`/api/sessions/${editingSession.id}`, sessionData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Session updated successfully');
      } else {
        await axios.post('/api/sessions', sessionData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Session created successfully');
      }
      setModalOpen(false);
      setEditingSession(null);
      fetchData();
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('Failed to save session');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Session deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    }
  };

  const exportCSV = () => {
    const csv = Papa.unparse(sessions.map(s => ({
      Course: s.course_name,
      Date: s.date,
      Time: s.time,
      Location: s.location,
      Trainer: trainers.find(t => t.id === s.trainer_id)?.email || 'Unknown',
      Attended: s.attended ? 'Yes' : 'No'
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'admin_sessions.csv');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Admin Sessions Report', 14, 16);
    doc.autoTable({
      startY: 20,
      head: [['Course', 'Date', 'Time', 'Location', 'Trainer', 'Attended']],
      body: sessions.map(s => [
        s.course_name,
        s.date,
        s.time,
        s.location,
        trainers.find(t => t.id === s.trainer_id)?.email || 'Unknown',
        s.attended ? 'Yes' : 'No'
      ])
    });
    doc.save('admin_sessions.pdf');
  };

  const handleSaveUser = async (form) => {
    try {
      const token = localStorage.getItem('token');
      if (editingUser) {
        await axios.put(`/api/users/${editingUser.id}`, form, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('User updated successfully');
      } else {
        await axios.post('/api/users', form, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('User created successfully');
      }
      setUserModalOpen(false);
      setEditingUser(null);
      fetchData();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('User deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const { todaySessions, upcomingSessions } = getTodayAndUpcomingSessions(filteredSessions);

  if (loading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="dashboard-bg">
      <div className="dashboard-container">
        <ToastContainer />
        {/* 50x Modern UI: Animated glassmorphism cards, beautiful gradients, elegant badges */}
        <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.85)', boxShadow: '0 8px 32px 0 rgba(80,112,255,0.18)', border: '2px solid #a5b4fc', marginBottom: 32, animation: 'fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32 }}>
            <div>
              <h2 className="dashboard-header" style={{ fontSize: '2.7rem', background: 'linear-gradient(90deg,#6366f1 0%,#a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Welcome, {user.email}</h2>
              <p className="text-sm" style={{ color: '#6366f1', fontWeight: 600 }}>Admin Dashboard</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button onClick={onLogout} className="dashboard-btn bg-red-500" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Logout</button>
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
                  {s.course_name} <span style={{ fontWeight: 400, fontSize: 13 }}>({s.time})</span> <span style={{ fontWeight: 400, fontSize: 13, color: '#fbbf24' }}>by {s.trainer_email || trainers.find(t => t.id === s.trainer_id)?.email || 'Unknown'}</span>
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
                  {s.course_name} <span style={{ fontWeight: 400, fontSize: 13 }}>({s.date} {s.time})</span> <span style={{ fontWeight: 400, fontSize: 13, color: '#fbbf24' }}>by {s.trainer_email || trainers.find(t => t.id === s.trainer_id)?.email || 'Unknown'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="dashboard-card" style={{ background: 'rgba(236,239,255,0.7)', marginBottom: 16 }}>
            <h3 className="dashboard-section-title">Trainer Activity Notifications</h3>
            <ul>
              {notifications.slice(0, 5).map((n, i) => (
                <li key={n.id || i} style={{ color: n.type === 'busy' ? '#f87171' : '#6366f1', fontWeight: 600 }}>
                  {n.message} <span style={{ fontWeight: 400, color: '#888', fontSize: 12 }}>({new Date(n.created_at).toLocaleString()})</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="dashboard-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="dashboard-section-title">All Sessions</h3>
            <button
              onClick={() => setModalOpen(true)}
              className="dashboard-btn"
            >
              Add Session
            </button>
          </div>
          
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
                  <th>Trainer</th>
                  <th>Scheduled By</th>
                  <th>Status</th>
                  <th>Attended</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSessions.map((session) => (
                  <tr key={session.id}>
                    <td>{session.course_name}</td>
                    <td>{session.date}</td>
                    <td>{session.time}</td>
                    <td>{session.location}</td>
                    <td>{session.trainer_email || trainers.find(t => t.id === session.trainer_id)?.email || 'Unknown'}</td>
                    <td>
                      {session.created_by_trainer ? <span className="dashboard-btn bg-yellow-400 text-black" style={{ fontSize: 12, padding: '2px 8px' }}>Trainer</span> : <span className="dashboard-btn bg-blue-200 text-black" style={{ fontSize: 12, padding: '2px 8px' }}>Admin</span>}
                    </td>
                    <td>{session.approval_status || 'approved'}</td>
                    <td>{session.attended ? 'Yes' : 'No'}</td>
                    <td>
                      <button
                        onClick={() => {
                          setEditingSession(session);
                          setModalOpen(true);
                        }}
                        className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ReactPaginate
            previousLabel="Previous"
            nextLabel="Next"
            pageCount={Math.ceil(filteredSessions.length / itemsPerPage)}
            onPageChange={({ selected }) => setCurrentPage(selected + 1)}
            containerClassName="flex justify-center mt-4"
            pageClassName="mx-1"
            pageLinkClassName="px-3 py-2 border rounded"
            activeLinkClassName="bg-indigo-500 text-white"
            previousClassName="mx-1"
            nextClassName="mx-1"
            previousLinkClassName="px-3 py-2 border rounded"
            nextLinkClassName="px-3 py-2 border rounded"
          />
        </div>

        <div className="dashboard-card">
          <h3 className="dashboard-section-title">Export</h3>
          <button onClick={exportCSV} className="dashboard-btn bg-green-600">
            Export CSV
          </button>
          <button onClick={exportPDF} className="dashboard-btn bg-blue-600">
            Export PDF
          </button>
        </div>

        <div className="dashboard-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="dashboard-section-title">User Management</h3>
            <button onClick={() => { setUserModalOpen(true); setEditingUser(null); }} className="dashboard-btn">Add User</button>
          </div>
          <div className="overflow-x-auto">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="px-4 py-2">{u.name}</td>
                    <td className="px-4 py-2">{u.email}</td>
                    <td className="px-4 py-2">{u.role}</td>
                    <td className="px-4 py-2">
                      <button onClick={() => { setEditingUser(u); setUserModalOpen(true); }} className="bg-blue-500 text-white px-3 py-1 rounded mr-2">Edit</button>
                      <button onClick={() => handleDeleteUser(u.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <UserModal isOpen={userModalOpen} onClose={() => { setUserModalOpen(false); setEditingUser(null); }} onSave={handleSaveUser} userData={editingUser} />
        </div>
        {/* Calendar View for Trainer Utilization */}
        <div className="dashboard-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="dashboard-section-title">Trainer Utilization Calendar</h3>
            <div className="flex gap-2 items-center">
              <button onClick={() => handleCalendarSourceChange('backend')} className={`dashboard-btn ${calendarSource === 'backend' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Show Backend Data</button>
              <label className="dashboard-btn bg-gray-200 cursor-pointer">
                <input type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} className="hidden" />
                Upload Excel
              </label>
              {excelFileName && <span className="text-sm text-gray-600">{excelFileName} <button onClick={() => handleCalendarSourceChange('backend')} className="ml-2 text-red-500">(Clear)</button></span>}
            </div>
          </div>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            views={['month', 'week', 'day']}
            tooltipAccessor={event => event.title}
            eventPropGetter={event => {
              const style = {
                backgroundColor: '#3B82F6',
                color: 'white',
                borderRadius: '6px',
                padding: '4px'
              };
              return { style };
            }}
          />
        </div>
        {/* Trainer Utilization Report */}
        <div className="dashboard-card">
          <TrainerUtilization />
        </div>
        <SessionModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingSession(null);
          }}
          onSave={handleSaveSession}
          sessionData={editingSession}
          trainers={trainers}
        />
      </div>
    </div>
  );
}

export default AdminDashboard;
export { SessionModal, sendEmailNotification };


