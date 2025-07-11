// client/src/CalendarView.js
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { format, parseISO } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { parseISO as parseISODate } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { sessionService } from './api';

import moment from 'moment';
const localizer = momentLocalizer(moment);

function CalendarView({ token }) {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        async function fetchSessions() {
            try {
                const res = await sessionService.getAllSessions();
                const data = res.data;
                const formattedEvents = data.map(session => {
                    const start = new Date(`${session.session_date}T${session.session_time}`);
                    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration
                    return {
                        id: session.id,
                        title: `${session.course_name} (${session.location})`,
                        start,
                        end,
                        allDay: false,
                        resource: session
                    };
                });

                setEvents(formattedEvents);
            } catch (err) {
                console.error('Error loading sessions:', err);
            }
        }

        fetchSessions();
    }, [token]);

    // Check if event is today or upcoming
    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Trainer Schedule</h2>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                views={['month', 'week', 'day']}
                tooltipAccessor={(event) => `${event.title} - ${format(event.start, 'PPpp')}`}
                eventPropGetter={(event) => {
                    const style = {
                        backgroundColor: isToday(event.start) ? '#34D399' : '#3B82F6',
                        color: 'white',
                        borderRadius: '6px',
                        padding: '4px'
                    };
                    return { style };
                }}
            />
        </div>
    );
}

CalendarView.propTypes = {
  token: PropTypes.string,
};

export default CalendarView;
