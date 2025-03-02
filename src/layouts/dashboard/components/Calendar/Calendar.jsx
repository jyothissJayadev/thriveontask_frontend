import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import "./Calendar.css";

const Calendar = ({
  // Calendar config props
  initialDate = new Date(),
  events = [],
  onEventClick = () => {},
  onDateSelect = () => {},
  onMonthChange = () => {},
  // Visual customization
  primaryColor = "#3b82f6",
  secondaryColor = "#93c5fd",
  textColor = "#1e293b",
  minimalUI = false,
}) => {
  // State management
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(null);
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [hoverDay, setHoverDay] = useState(null);
  const [viewMode, setViewMode] = useState("month"); // 'month', 'week', or 'day'

  // Extract year and month
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Calculate days in month and create calendar days
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Month name formatting
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Day names
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Filter events for current month
  useEffect(() => {
    // Only update displayed events if they actually changed
    const filtered = events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
    });

    // Prevent unnecessary state updates by comparing arrays
    const hasChanged =
      filtered.length !== displayedEvents.length ||
      filtered.some((event, index) => displayedEvents[index]?.id !== event.id);

    if (hasChanged) {
      setDisplayedEvents(filtered);
    }

    // Call this outside the condition to ensure it runs on month changes
    onMonthChange(new Date(currentYear, currentMonth, 1));
  }, [currentMonth, currentYear, events, onMonthChange, displayedEvents]);

  // Handle month navigation
  const navigateMonth = (direction) => {
    setIsAnimating(true);

    setTimeout(() => {
      const newDate = new Date(currentYear, currentMonth + direction, 1);
      setCurrentDate(newDate);
      setIsAnimating(false);
    }, 200);
  };

  // Navigate to specific month/year
  const navigateToMonthYear = (month, year) => {
    setIsAnimating(true);

    setTimeout(() => {
      const newDate = new Date(year, month, 1);
      setCurrentDate(newDate);
      setIsAnimating(false);
    }, 200);
  };

  // Navigate to previous year
  const navigateToPreviousYear = () => {
    navigateToMonthYear(currentMonth, currentYear - 1);
  };

  // Navigate to next year
  const navigateToNextYear = () => {
    navigateToMonthYear(currentMonth, currentYear + 1);
  };

  // Navigate to previous month
  const navigateToPreviousMonth = () => {
    navigateMonth(-1);
  };

  // Navigate to next month
  const navigateToNextMonth = () => {
    navigateMonth(1);
  };

  // Handle date selection
  const handleDateClick = (day) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(selectedDate);
    onDateSelect(selectedDate);
  };

  // Check if a day has events
  const hasEvents = (day) => {
    return displayedEvents.some((event) => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === day;
    });
  };

  // Get events for a day
  const getEventsForDay = (day) => {
    return displayedEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === day;
    });
  };

  // Sort events by time
  const sortEventsByTime = (events) => {
    return [...events].sort((a, b) => {
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time.localeCompare(b.time);
    });
  };

  // Toggle view mode
  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  // Get events count by day
  const getEventsCountMap = () => {
    const countMap = {};

    displayedEvents.forEach((event) => {
      const eventDate = new Date(event.date);
      const day = eventDate.getDate();

      if (!countMap[day]) {
        countMap[day] = 0;
      }

      countMap[day]++;
    });

    return countMap;
  };

  // Find the day with most events
  const findDayWithMostEvents = () => {
    const countMap = getEventsCountMap();
    let maxDay = 0;
    let maxCount = 0;

    Object.entries(countMap).forEach(([day, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxDay = parseInt(day);
      }
    });

    return maxDay > 0 ? maxDay : null;
  };

  // Get today's events
  const getTodayEvents = () => {
    const today = new Date();

    if (today.getMonth() === currentMonth && today.getFullYear() === currentYear) {
      return getEventsForDay(today.getDate());
    }

    return [];
  };

  // Generate calendar grid cells
  const renderCalendarDays = () => {
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-empty-day"></div>);
    }

    // Add cells for each day in the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        new Date().getDate() === day &&
        new Date().getMonth() === currentMonth &&
        new Date().getFullYear() === currentYear;

      const isSelected =
        selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentMonth &&
        selectedDate.getFullYear() === currentYear;

      const dayEvents = getEventsForDay(day);
      const eventCount = dayEvents.length;
      const isHovered = hoverDay === day;

      days.push(
        <div
          key={`day-${day}`}
          onClick={() => handleDateClick(day)}
          onMouseEnter={() => setHoverDay(day)}
          onMouseLeave={() => setHoverDay(null)}
          className={`calendar-day 
            ${isToday ? "calendar-today" : ""} 
            ${isSelected ? "calendar-selected" : ""} 
            ${isHovered ? "calendar-day-hover" : ""} 
            ${eventCount > 0 ? "calendar-has-events" : ""}`}
          style={{
            "--primary-color": primaryColor,
            "--secondary-color": secondaryColor,
            "--text-color": textColor,
          }}
        >
          <span className={`calendar-day-number ${isSelected ? "day-selected" : ""}`}>{day}</span>

          {eventCount > 0 && !minimalUI && (
            <div className="calendar-event-indicator">
              {eventCount <= 3 ? (
                <div className="calendar-event-dots">
                  {Array(eventCount)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="calendar-event-dot" />
                    ))}
                </div>
              ) : (
                <span className="calendar-event-count">{eventCount}</span>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  // Custom date formatting
  const formatDate = (date) => {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <div className="calendar-container">
      {/* Header with month navigation */}
      <div className="calendar-header">
        <div className="calendar-title">
          <CalendarIcon className="calendar-icon" />
          <h2>
            {monthNames[currentMonth]} {currentYear}
          </h2>
        </div>

        <div className="calendar-nav">
          <button
            onClick={navigateToPreviousYear}
            className="calendar-year-nav-button"
            title="Previous Year"
          >
            <ArrowLeft />
          </button>
          <button
            onClick={navigateToPreviousMonth}
            className="calendar-nav-button"
            title="Previous Month"
          >
            <ChevronLeftIcon style={{ color: "red", fontSize: "24px" }} />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="calendar-today-button">
            Today
          </button>
          <button onClick={navigateToNextMonth} className="calendar-nav-button" title="Next Month">
            <NavigateNextIcon style={{ color: "red", fontSize: "24px" }} />
          </button>
          <button
            onClick={navigateToNextYear}
            className="calendar-year-nav-button"
            title="Next Year"
          >
            <ArrowRight />
          </button>
        </div>
      </div>

      {/* View mode selector */}
      <div className="calendar-view-modes">
        <button
          className={`view-mode-button ${viewMode === "month" ? "active" : ""}`}
          onClick={() => toggleViewMode("month")}
        >
          Month
        </button>
        <button
          className={`view-mode-button ${viewMode === "week" ? "active" : ""}`}
          onClick={() => toggleViewMode("week")}
        >
          Week
        </button>
        <button
          className={`view-mode-button ${viewMode === "day" ? "active" : ""}`}
          onClick={() => toggleViewMode("day")}
        >
          Day
        </button>
      </div>

      {/* Calendar quick info */}
      <div className="calendar-quick-info">
        <span className="calendar-events-count">
          {displayedEvents.length} event{displayedEvents.length !== 1 ? "s" : ""} this month
        </span>
        {findDayWithMostEvents() && (
          <span className="calendar-busy-day">
            Busiest day: {monthNames[currentMonth]} {findDayWithMostEvents()}
          </span>
        )}
      </div>

      {/* Day names header */}
      <div className="calendar-days-header">
        {dayNames.map((day) => (
          <div key={day} className="calendar-weekday">
            <span>{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={`calendar-grid ${isAnimating ? "calendar-animating" : ""}`}>
        {renderCalendarDays()}
      </div>

      {/* Today's events summary */}
      {getTodayEvents().length > 0 && (
        <div className="calendar-today-events">
          <h4>Today&apos;s Events</h4>
          <div className="today-events-list">
            {getTodayEvents()
              .slice(0, 2)
              .map((event, idx) => (
                <div key={idx} className="today-event-item">
                  <span className="today-event-time">{event.time || "All day"}</span>
                  <span className="today-event-title">{event.title}</span>
                </div>
              ))}
            {getTodayEvents().length > 2 && (
              <div className="today-more-events">+{getTodayEvents().length - 2} more</div>
            )}
          </div>
        </div>
      )}

      {/* Selected date events display */}
      {selectedDate && (
        <div className="calendar-events-container">
          <div className="calendar-events-header">
            <h3>{formatDate(selectedDate)}</h3>
            <button onClick={() => setShowEventModal(true)} className="calendar-add-event">
              <Plus />
              <span>Add</span>
            </button>
          </div>

          <div className="calendar-events-list">
            {getEventsForDay(selectedDate.getDate()).length > 0 ? (
              sortEventsByTime(getEventsForDay(selectedDate.getDate())).map((event, idx) => (
                <div key={idx} onClick={() => onEventClick(event)} className="calendar-event-item">
                  <div className="calendar-event-content">
                    <div
                      className="calendar-event-marker"
                      style={{ backgroundColor: event.color || primaryColor }}
                    ></div>
                    <div className="calendar-event-details">
                      <p className="calendar-event-title">{event.title}</p>
                      {event.time && <p className="calendar-event-time">{event.time}</p>}
                      {event.description && (
                        <p className="calendar-event-description">{event.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="calendar-no-events">No events</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// PropTypes validation
Calendar.propTypes = {
  initialDate: PropTypes.instanceOf(Date),
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      time: PropTypes.string,
      description: PropTypes.string,
      color: PropTypes.string,
    })
  ),
  onEventClick: PropTypes.func,
  onDateSelect: PropTypes.func,
  onMonthChange: PropTypes.func,
  primaryColor: PropTypes.string,
  secondaryColor: PropTypes.string,
  textColor: PropTypes.string,
  minimalUI: PropTypes.bool,
};

export default Calendar;
