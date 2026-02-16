import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const TodoCalendar = ({ todos }) => {
    const events = todos
        .filter(t => t.deadline)
        .map(t => ({
            title: t.title,
            start: new Date(t.deadline),
            end: new Date(t.deadline),
            allDay: true,
            resource: t
        }));

    const eventStyleGetter = (event, start, end, isSelected) => {
        let backgroundColor = '#8B5CF6'; // default purple
        if (event.resource.priority === 2) backgroundColor = '#EF4444'; // red for high
        if (event.resource.priority === 1) backgroundColor = '#F59E0B'; // yellow for medium
        if (event.resource.isCompleted) backgroundColor = '#10B981'; // green for completed

        const style = {
            backgroundColor,
            borderRadius: '5px',
            opacity: 0.8,
            color: 'white',
            border: '0px',
            display: 'block'
        };
        return { style };
    };

    return (
        <div className="h-[600px] bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/50">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'day']}
            />
        </div>
    );
};

export default TodoCalendar;
