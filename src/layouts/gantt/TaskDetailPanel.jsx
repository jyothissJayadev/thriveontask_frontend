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
      onSaveDay(startHour, startMinute, endHour, endMinute);
    } else if (viewMode === "week") {
      const startDay = parseInt(document.getElementById("start-day").value);
      const endDay = parseInt(document.getElementById("end-day").value);
      onSaveWeek(startDay, endDay);
    } else if (viewMode === "month") {
      const startDate = parseInt(document.getElementById("start-date").value);
      const endDate = parseInt(document.getElementById("end-date").value);
      onSaveMonth(startDate, endDate);
    }
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
