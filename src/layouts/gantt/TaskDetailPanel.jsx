// TaskDetailPanel.jsx
import React from "react";
import PropTypes from "prop-types";

const TaskDetailPanel = ({
  selectedTask,
  viewMode,
  onClose,
  onSaveDay,
  onSaveWeek,
  onSaveMonth,
  getHours,
  getMinutes,
  getProgressPercentage,
}) => {
  const handleSave = () => {
    if (viewMode === "day") {
      const startHour = parseInt(document.getElementById("start-hour").value);
      const startMinute = parseInt(document.getElementById("start-minute").value);
      const endHour = parseInt(document.getElementById("end-hour").value);
      const endMinute = parseInt(document.getElementById("end-minute").value);

      // Get the selected dates
      const startDate = new Date(document.getElementById("start-date-input").value);
      const endDate = new Date(document.getElementById("end-date-input").value);

      // Create full datetime objects
      const newStartDate = new Date(startDate);
      newStartDate.setHours(startHour, startMinute);

      const newEndDate = new Date(endDate);
      newEndDate.setHours(endHour, endMinute);

      // Check if start time is after end time
      if (newStartDate > newEndDate) {
        alert("Start time cannot be after end time");
        return;
      }

      onSaveDay(startHour, startMinute, endHour, endMinute, newStartDate, newEndDate);
    } else if (viewMode === "week") {
      const startDay = parseInt(document.getElementById("start-day").value);
      const endDay = parseInt(document.getElementById("end-day").value);

      // Get the selected dates
      const startDate = new Date(document.getElementById("start-week-input").value);
      const endDate = new Date(document.getElementById("end-week-input").value);

      // Check if start day is after end day when in same week
      if (startDate.getTime() === endDate.getTime() && startDay > endDay) {
        alert("Start day cannot be after end day in the same week");
        return;
      }

      onSaveWeek(startDay, endDay, startDate, endDate);
    } else if (viewMode === "month") {
      const startDate = parseInt(document.getElementById("start-date").value);
      const endDate = parseInt(document.getElementById("end-date").value);

      // Get the selected month end date
      const monthEndDate = new Date(document.getElementById("end-month-input").value);

      // Create temporary dates to check if start is after end
      const tempStartDate = new Date(monthEndDate);
      tempStartDate.setDate(startDate);

      const tempEndDate = new Date(monthEndDate);
      tempEndDate.setDate(endDate);

      // If they're in the same month and start date is after end date
      if (tempStartDate.getMonth() === tempEndDate.getMonth() && startDate > endDate) {
        alert("Start date cannot be after end date in the same month");
        return;
      }

      onSaveMonth(startDate, endDate, monthEndDate);
    }
  };
  // Add to TaskDetailPanel.jsx

  // Inside the component, add these helper functions
  const getFormattedDate = (date) => {
    return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };

  const getTodayDate = () => {
    return getFormattedDate(new Date());
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return getFormattedDate(tomorrow);
  };

  const getThisWeekEnd = () => {
    const now = new Date();
    const dayOfWeek = now.getDay() || 7; // Convert Sunday (0) to 7
    const daysUntilWeekEnd = 7 - dayOfWeek;
    const thisWeekEnd = new Date();
    thisWeekEnd.setDate(now.getDate() + daysUntilWeekEnd);
    return getFormattedDate(thisWeekEnd);
  };

  const getNextWeekEnd = () => {
    const now = new Date();
    const dayOfWeek = now.getDay() || 7;
    const daysUntilNextWeekEnd = 14 - dayOfWeek;
    const nextWeekEnd = new Date();
    nextWeekEnd.setDate(now.getDate() + daysUntilNextWeekEnd);
    return getFormattedDate(nextWeekEnd);
  };

  const getThisMonthEnd = () => {
    const now = new Date();
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return getFormattedDate(thisMonthEnd);
  };

  const getNextMonthEnd = () => {
    const now = new Date();
    const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    return getFormattedDate(nextMonthEnd);
  };
  return (
    <div className="task-detail-panel">
      <div className="task-detail-header">
        <h3>{selectedTask.name} Details</h3>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="task-detail-content">
        {/* Day View Controls */}
        {viewMode === "day" && (
          <>
            <div className="detail-row">
              <label>Start Time:</label>
              <div className="time-selector">
                <select
                  id="start-hour"
                  className="time-select"
                  defaultValue={getHours(selectedTask.startTime)}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <span>:</span>
                <select
                  id="start-minute"
                  className="time-select"
                  defaultValue={getMinutes(selectedTask.startTime)}
                >
                  {Array.from({ length: 12 }, (_, i) => i * 5).map((min) => (
                    <option key={min} value={min}>
                      {min.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="detail-row">
              <label>End Time:</label>
              <div className="time-selector">
                <select
                  id="end-hour"
                  className="time-select"
                  defaultValue={getHours(selectedTask.endDate)}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <span>:</span>
                <select
                  id="end-minute"
                  className="time-select"
                  defaultValue={getMinutes(selectedTask.endDate)}
                >
                  {Array.from({ length: 12 }, (_, i) => i * 5).map((min) => (
                    <option key={min} value={min}>
                      {min.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {/* Week View Controls */}
        {viewMode === "week" && (
          <>
            <div className="detail-row">
              <label>Start Day:</label>
              <div className="time-selector">
                <select
                  id="start-day"
                  className="time-select"
                  defaultValue={new Date(selectedTask.startTime).getDay() || 7}
                >
                  {[
                    { value: 1, label: "Monday" },
                    { value: 2, label: "Tuesday" },
                    { value: 3, label: "Wednesday" },
                    { value: 4, label: "Thursday" },
                    { value: 5, label: "Friday" },
                    { value: 6, label: "Saturday" },
                    { value: 7, label: "Sunday" },
                  ].map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="detail-row">
              <label>End Day:</label>
              <div className="time-selector">
                <select
                  id="end-day"
                  className="time-select"
                  defaultValue={new Date(selectedTask.endDate).getDay() || 7}
                >
                  {[
                    { value: 1, label: "Monday" },
                    { value: 2, label: "Tuesday" },
                    { value: 3, label: "Wednesday" },
                    { value: 4, label: "Thursday" },
                    { value: 5, label: "Friday" },
                    { value: 6, label: "Saturday" },
                    { value: 7, label: "Sunday" },
                  ].map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {/* Month View Controls */}
        {viewMode === "month" && (
          <>
            <div className="detail-row">
              <label>Start Date:</label>
              <div className="time-selector">
                <select
                  id="start-date"
                  className="time-select"
                  defaultValue={new Date(selectedTask.startTime).getDate()}
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                    <option key={date} value={date}>
                      {date}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="detail-row">
              <label>End Date:</label>
              <div className="time-selector">
                <select
                  id="end-date"
                  className="time-select"
                  defaultValue={new Date(selectedTask.endDate).getDate()}
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                    <option key={date} value={date}>
                      {date}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
        {/* Day View Controls - Add date selector */}
        {viewMode === "day" && (
          <>
            <div className="detail-row">
              <label>Date:</label>
              <div className="date-selector">
                <select
                  id="day-date-option"
                  className="date-select"
                  defaultValue="today"
                  onChange={(e) => {
                    const endHour = document.getElementById("end-hour");
                    if (e.target.value === "tomorrow") {
                      document.getElementById("start-date-input").value = getTodayDate();
                      document.getElementById("end-date-input").value = getTomorrowDate();
                    } else {
                      document.getElementById("start-date-input").value = getTodayDate();
                      document.getElementById("end-date-input").value = getTodayDate();
                    }
                  }}
                >
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                </select>
              </div>
            </div>
            <div className="detail-row" style={{ display: "none" }}>
              <input type="date" id="start-date-input" defaultValue={getTodayDate()} />
              <input type="date" id="end-date-input" defaultValue={getTodayDate()} />
            </div>
          </>
        )}

        {/* Week View Controls - Add week selector */}
        {viewMode === "week" && (
          <>
            <div className="detail-row">
              <label>Week End:</label>
              <div className="date-selector">
                <select
                  id="week-date-option"
                  className="date-select"
                  defaultValue="thisWeek"
                  onChange={(e) => {
                    if (e.target.value === "nextWeek") {
                      document.getElementById("end-week-input").value = getNextWeekEnd();
                    } else {
                      document.getElementById("end-week-input").value = getThisWeekEnd();
                    }
                  }}
                >
                  <option value="thisWeek">This Week</option>
                  <option value="nextWeek">Next Week</option>
                </select>
              </div>
            </div>
            <div className="detail-row" style={{ display: "none" }}>
              <input type="date" id="start-week-input" defaultValue={getTodayDate()} />
              <input type="date" id="end-week-input" defaultValue={getThisWeekEnd()} />
            </div>
          </>
        )}

        {/* Month View Controls - Add month selector */}
        {viewMode === "month" && (
          <>
            <div className="detail-row">
              <label>Month End:</label>
              <div className="date-selector">
                <select
                  id="month-date-option"
                  className="date-select"
                  defaultValue="thisMonth"
                  onChange={(e) => {
                    if (e.target.value === "nextMonth") {
                      document.getElementById("end-month-input").value = getNextMonthEnd();
                    } else {
                      document.getElementById("end-month-input").value = getThisMonthEnd();
                    }
                  }}
                >
                  <option value="thisMonth">This Month</option>
                  <option value="nextMonth">Next Month</option>
                </select>
              </div>
            </div>
            <div className="detail-row" style={{ display: "none" }}>
              <input type="date" id="start-month-input" defaultValue={getTodayDate()} />
              <input type="date" id="end-month-input" defaultValue={getThisMonthEnd()} />
            </div>
          </>
        )}
        <div className="detail-row">
          <label>Completion:</label>
          <span>{getProgressPercentage(selectedTask).toFixed(0)}%</span>
        </div>

        <button className="save-detail-button" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

TaskDetailPanel.propTypes = {
  selectedTask: PropTypes.object.isRequired,
  viewMode: PropTypes.oneOf(["day", "week", "month"]).isRequired,
  onClose: PropTypes.func.isRequired,
  onSaveDay: PropTypes.func.isRequired,
  onSaveWeek: PropTypes.func.isRequired,
  onSaveMonth: PropTypes.func.isRequired,
  getHours: PropTypes.func.isRequired,
  getMinutes: PropTypes.func.isRequired,
  getProgressPercentage: PropTypes.func.isRequired,
};

export default TaskDetailPanel;
