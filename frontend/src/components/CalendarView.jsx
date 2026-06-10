import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import {
  format,
  parse,
  startOfWeek,
  getDay,
} from 'date-fns';
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

const statusPalette = {
  present: {
    backgroundColor: 'rgb(var(--color-success))',
    color: '#ffffff',
  },
  absent: {
    backgroundColor: 'rgb(var(--color-danger))',
    color: '#ffffff',
  },
  late: {
    backgroundColor: 'rgb(var(--color-warning))',
    color: '#ffffff',
  },
  mixed: {
    backgroundColor: 'rgb(var(--color-info))',
    color: '#ffffff',
  },
};

const getAggregateStatus = (event) => {
  if (event.status) {
    return event.status;
  }

  const statuses = event.statuses || [];
  const uniqueStatuses = [...new Set(statuses.map((item) => item.status))];

  if (uniqueStatuses.length === 1) {
    return uniqueStatuses[0];
  }

  return 'mixed';
};

const buildEventLabel = (role, item) => {
  if (role === 'student') {
    return `Attendance: ${item.status}`;
  }

  const counts = item.counts || {};
  return `Present ${counts.present || 0} | Absent ${counts.absent || 0} | Late ${counts.late || 0}`;
};

const CalendarView = ({ role, events = [], onSelectEvent }) => {
  const calendarEvents = events.map((item) => {
    const day = new Date(item.date);
    const aggregateStatus = getAggregateStatus(item);

    return {
      ...item,
      title: buildEventLabel(role, item),
      start: day,
      end: day,
      allDay: true,
      aggregateStatus,
    };
  });

  return (
    <div className="attendance-calendar card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text">Attendance Calendar</h3>
        <p className="mt-1 text-sm text-text-muted">Green marks present, red marks absent, and yellow marks late.</p>
      </div>

      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 620 }}
        eventPropGetter={(event) => {
          const palette = statusPalette[event.aggregateStatus] || statusPalette.mixed;
          return {
            style: {
              backgroundColor: palette.backgroundColor,
              color: palette.color,
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 12px 24px -16px rgba(15, 23, 42, 0.35)',
              padding: '4px 8px',
            },
          };
        }}
        onSelectEvent={onSelectEvent}
      />
    </div>
  );
};

export default CalendarView;
