// client/src/AdminDashboard.js
// IMPORTANT: To resolve "Could not resolve" errors for FullCalendar,
// ensure you have installed all FullCalendar packages in your client directory:
// npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/list
// After installation, restart your frontend development server (npm start).

import React, { useState, useEffect } from 'react';
import { sessionService, userService } from './api';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';

// Modal for Add/Edit Session
function SessionModal({ isOpen, onClose, onSave, sessionData, trainers }) {
    const [formData, setFormData] = useState(sessionData || {
        trainer_id: '',
        course_name: '',
        date: '',
        time: '',
        location: ''
    });
    const [formError, setFormError] = useState('');

    useEffect(() => {
        // Update form data if sessionData changes (for edit mode)
        if (sessionData) {
            setFormData(sessionData);
        } else {
            // Reset for add mode
            setFormData({
                trainer_id: '',
                course_name: '',
                date: '',
                time: '',
                location: ''
            });
        }
        setFormError(''); // Clear errors on modal open/data change
    }, [sessionData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');
        // Basic validation
        if (!formData.trainer_id || !formData.course_name || !formData.date || !formData.time || !formData.location) {
            setFormError('All fields are required.');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{sessionData ? 'Edit Session' : 'Add Session'}</h2>
                {formError && <p className="text-red-600 text-sm mb-4">{formError}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="trainer_id" className="block text-sm font-medium text-gray-700">Trainer</label>
                        <select
                            id="trainer_id"
                            name="trainer_id"
                            value={formData.trainer_id}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        >
                            <option value="">Select Trainer</option>
                            {trainers.map(trainer => (
                                <option key={trainer.id} value={trainer.id}>{trainer.email}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="course_name" className="block text-sm font-medium text-gray-700">Course Name</label>
                        <input
                            type="text"
                            id="course_name"
                            name="course_name"
                            value={formData.course_name}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time</label>
                        <input
                            type="time"
                            id="time"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
                        >
                            Save Session
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


function AdminDashboard({ user, onLogout }) {
    const [events, setEvents] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSession, setCurrentSession] = useState(null); // For editing

    // Function to fetch all sessions and trainers
    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found.');
                setLoading(false);
                return;
            }

            // Fetch sessions
            const sessionsResponse = await sessionService.getAllSessions();

            // Fetch trainers
            const trainersResponse = await userService.getAllUsers();
            setTrainers(trainersResponse.data.filter(u => u.role === 'trainer'));

            // Map events for FullCalendar
            const mappedEvents = sessionsResponse.data.map(session => ({
                id: session.id,
                title: `${session.course_name} - ${session.location} (Trainer: ${session.trainer_email || 'N/A'})`,
                date: session.date,
                startTime: session.time,
                extendedProps: {
                    location: session.location,
                    trainerId: session.trainer_id,
                    courseName: session.course_name,
                    trainerEmail: session.trainer_email // For display in modal/details
                },
                color: getColorForTrainer(session.trainer_id), // Assign color based on trainer
                // Highlight today's events
                classNames: new Date(session.date).toDateString() === new Date().toDateString() ? ['bg-purple-500', 'text-white', 'font-bold'] : [],
            }));
            setEvents(mappedEvents);

            // Check for upcoming sessions in the next 24 hours
            const now = new Date();
            const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const upcoming = sessionsResponse.data.filter(session => {
                const sessionDateTime = new Date(`${session.date}T${session.time}`);
                return sessionDateTime > now && sessionDateTime <= next24Hours;
            });

            if (upcoming.length > 0) {
                const upcomingTitles = upcoming.map(s => `${s.course_name} at ${s.time} by ${s.trainer_email}`).join(', ');
                setNotification(`Upcoming sessions in next 24 hrs: ${upcomingTitles}`);
            } else {
                setNotification('No upcoming sessions in the next 24 hours.');
            }

        } catch (err) {
            console.error('Error fetching data for admin dashboard:', err);
            setError('Failed to load data. Please ensure backend is running and you have admin privileges.');
            setNotification('Failed to load upcoming session notifications.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [user]); // Refetch when user changes

    // Simple color assignment based on trainer ID
    const getColorForTrainer = (trainerId) => {
        const colors = ['#3f51b5', '#e91e63', '#009688', '#ff9800', '#673ab7', '#8bc34a']; // Sample colors
        return colors[trainerId % colors.length]; // Cycle through colors
    };

    const handleAddSessionClick = () => {
        setCurrentSession(null); // Clear any existing session data
        setIsModalOpen(true);
    };

    const handleEditSession = (info) => {
        // info.event.extendedProps contains our custom data
        const sessionToEdit = {
            id: info.event.id,
            trainer_id: info.event.extendedProps.trainerId,
            course_name: info.event.extendedProps.courseName,
            date: info.event.startStr.split('T')[0], // Extract YYYY-MM-DD
            time: info.event.extendedProps.startTime,
            location: info.event.extendedProps.location
        };
        setCurrentSession(sessionToEdit);
        setIsModalOpen(true);
    };

    const handleDeleteSession = async (info) => {
        if (window.confirm(`Are you sure you want to delete session "${info.event.title}"?`)) {
            try {
                await sessionService.deleteSession(info.event.id);
                alert('Session deleted successfully!');
                fetchAllData(); // Refresh calendar
            } catch (err) {
                console.error('Error deleting session:', err);
                alert('Failed to delete session. Check console for details.');
            }
        }
    };

    const handleSaveSession = async (data) => {
        try {
            if (data.id) {
                // Edit existing session
                await sessionService.updateSession(data.id, data);
                alert('Session updated successfully!');
            } else {
                // Add new session
                await sessionService.createSession(data);
                alert('Session added successfully!');
            }
            setIsModalOpen(false);
            fetchAllData(); // Refresh calendar
        } catch (err) {
            console.error('Error saving session:', err);
            alert('Failed to save session. Check console for details.');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-700 text-lg">Loading data...</p></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-red-100"><p className="text-red-700 text-lg">{error}</p></div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-600 text-white p-6 flex flex-col items-center">
            <div className="bg-white text-gray-800 p-8 rounded-xl shadow-lg w-full max-w-4xl text-center mb-8">
                <h2 className="text-4xl font-extrabold mb-4">Welcome, Admin {user.email}!</h2>
                <p className="text-lg mb-4">Your ID: {user.id} | Role: {user.role}</p>
                <button
                    onClick={onLogout}
                    className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition duration-200"
                >
                    Logout
                </button>
            </div>

            {notification && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-md w-full max-w-4xl mb-6" role="alert">
                    <p className="font-bold">Notification:</p>
                    <p>{notification}</p>
                </div>
            )}

            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-4xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">All Trainer Timetables</h3>
                <div className="mb-4 flex justify-end">
                    <button
                        onClick={handleAddSessionClick}
                        className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200"
                    >
                        Add New Session
                    </button>
                </div>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
                    initialView="dayGridMonth"
                    events={events}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
                    }}
                    editable={true} // Allow dragging and resizing events
                    selectable={true} // Allow selecting dates for new events
                    eventClick={handleEditSession} // Handle click for edit/delete
                    eventDrop={handleEditSession} // Handle event drag-and-drop (updates date/time)
                    eventResize={handleEditSession} // Handle event resizing (updates duration)
                    height="auto"
                />
            </div>

            {/* Session Add/Edit Modal */}
            <SessionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveSession}
                sessionData={currentSession}
                trainers={trainers}
            />
        </div>
    );
}

export default AdminDashboard;
