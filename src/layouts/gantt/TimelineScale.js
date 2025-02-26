// TimelineScale.jsx
import React, { useState, useRef, useEffect } from "react";
import { GripVertical } from "lucide-react";
import "./TimelineScale.css";
import { getTasks, updateTaskTime } from "api/api";
import toast, { Toaster } from "react-hot-toast";
import TaskDetailPanel from "./TaskDetailPanel";

const TimelineScale = () => {
  const [tasks, setTasks] = useState({
    day: [],
    week: [],
    month: [],
  });

  const [viewMode, setViewMode] = useState("day");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeType, setResizeType] = useState(null);
  const [startX, setStartX] = useState(0);
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [resizingEvent, setResizingEvent] = useState(null);
  const [initialWidth, setInitialWidth] = useState(0);
  const [initialPosition, setInitialPosition] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const timelineRef = useRef(null);
  const containerRef = useRef(null);
  const cellWidth = zoomLevel;
  const token = localStorage.getItem("jwtToken");
  const [selectedTask, setSelectedTask] = useState(null);
  const fetchTasks = async () => {
    try {
      const data = await getTasks(token); // Assuming getTasks is your API call
      if (data.success) {
        const groupedTasks = {
          day: [],
          week: [],
          month: [],
        };

        data.tasks.forEach((task) => {
          const {
            taskName,
            completedUnits,
            numberOfUnits,
            timeframe,
            createdAt,
            endDate,
            updatedAt,
          } = task;

          const taskObject = {
            id: String(task._id),
            name: taskName,
            completion: completedUnits,
            startTime: createdAt,
            endDate: endDate,
            updatedAt: updatedAt,
            numberOfUnits: numberOfUnits,
          };

          if (timeframe === "day") {
            groupedTasks.day.push(taskObject);
          } else if (timeframe === "week") {
            groupedTasks.week.push(taskObject);
          } else if (timeframe === "month") {
            groupedTasks.month.push(taskObject);
          }
        });

        setTasks(groupedTasks);
      } else {
        console.error("Error fetching tasks:", data.error);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };
  useEffect(() => {
    fetchTasks();
  }, [token]);

  const saveChanges = async () => {
    // Find tasks that have been modified since last save
    const modifiedTasks = [];

    Object.keys(tasks).forEach((timeframe) => {
      tasks[timeframe].forEach((task) => {
        // Check if task has been modified
        if (task.hasChanges) {
          modifiedTasks.push({
            id: task.id,
            startTime: new Date(task.startTime).toISOString(), // Converts to ISO string
            endTime: new Date(task.endDate).toISOString(), // Converts to ISO string
          });
        }
      });
    });

    if (modifiedTasks.length > 0) {
      try {
        // Loop through modified tasks and update each
        for (const modifiedTask of modifiedTasks) {
          const { id, startTime, endTime } = modifiedTask;

          // Call the API to update the task
          const response = await updateTaskTime(id, startTime, endTime, token);
          console.log(response);
        }

        console.log("Updated tasks:", modifiedTasks);
        toast.success("Changes saved successfully!");

        // Reset the hasChanges flags on all tasks
        setTasks((prevTasks) => {
          const updatedTasks = { ...prevTasks };

          Object.keys(updatedTasks).forEach((timeframe) => {
            updatedTasks[timeframe] = updatedTasks[timeframe].map((task) => ({
              ...task,
              hasChanges: false,
            }));
          });

          return updatedTasks;
        });

        setHasChanges(false); // Reset the global changes state
      } catch (error) {
        console.error("Error saving tasks:", error);
        toast.error(`Error saving tasks: ${error.message || "Unknown error"}`);
      }
    } else {
      toast.info("No changes to save.");
    }
  };
  const getTaskColor = (taskId) => {
    const colors = [
      "#FF5733",
      "#33FF57",
      "#3357FF",
      "#FF33A1",
      "#FFC300",
      "#DAF7A6",
      "#900C3F",
      "#581845",
      "#C70039",
      "#FF6F61",
    ];

    // Generate a hash from the task ID
    const hash = [...taskId].reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Use the hash modulo to get an index in the color array
    return colors[hash % colors.length];
  };
  const getProgressPercentage = (task) => {
    return (task.completion / task.numberOfUnits) * 100;
  };

  const formatDate = (dateString, format) => {
    const date = new Date(dateString);
    switch (format) {
      case "hour":
        return date.getHours().toString().padStart(2, "0") + ":00";
      case "day":
        return date.toLocaleDateString("en-US", {
          weekday: "short",
        });
      case "date":
        return date.getDate();
      default:
        return date.toLocaleDateString();
    }
  };

  const generateTimeSlots = () => {
    switch (viewMode) {
      case "day":
        return Array.from({ length: 24 }, (_, i) => {
          const hour = i.toString().padStart(2, "0");
          return `${hour}:00`;
        });
      case "week":
        const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        return weekdays;
      case "month":
        return Array.from({ length: 31 }, (_, i) => i + 1);
      default:
        return [];
    }
  };

  const getTimeSlotWidth = () => {
    // Adjust width based on view mode to ensure proper scaling
    switch (viewMode) {
      case "day":
        return cellWidth;
      case "week":
        return cellWidth * 3; // Make week slots wider
      case "month":
        return cellWidth; // Adjust as needed
      default:
        return cellWidth;
    }
  };

  const getTaskPosition = (task) => {
    const currentTasks = tasks[viewMode];
    const taskData = currentTasks.find((t) => t.id === task.id);
    if (!taskData) return { left: 0, width: 0 };

    const start = new Date(taskData.startTime);
    const end = new Date(taskData.endDate);
    const slotWidth = getTimeSlotWidth();

    switch (viewMode) {
      case "day":
        const startHour = start.getHours();
        const endHour = end.getHours() || 24; // If end hour is 0, treat as midnight (24)
        const duration = endHour - startHour;
        return {
          left: startHour * slotWidth,
          width: Math.max(duration * slotWidth, slotWidth / 2), // Ensure minimum width
        };
      case "week":
        const startDay = start.getDay() || 7; // Convert Sunday (0) to 7 for easier calculation
        const endDay = end.getDay() || 7;
        const dayDuration = endDay >= startDay ? endDay - startDay : 7 - startDay + endDay;
        return {
          left: (startDay - 1) * slotWidth, // Adjust for Monday (1) as first day
          width: Math.max(dayDuration * slotWidth, slotWidth / 2),
        };
      case "month":
        const startDate = start.getDate();
        const endDate = end.getDate();
        const dateDuration = endDate >= startDate ? endDate - startDate : 31 - startDate + endDate;
        return {
          left: (startDate - 1) * slotWidth,
          width: Math.max(dateDuration * slotWidth, slotWidth / 2),
        };
      default:
        return { left: 0, width: 0 };
    }
  };

  const updateTaskTimes = (taskId, newStart, newEnd) => {
    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
      const currentTimeframe = viewMode;

      updatedTasks[currentTimeframe] = updatedTasks[currentTimeframe].map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            startTime: newStart,
            endDate: newEnd,
            hasChanges: true, // Add this flag to track changes
          };
        }
        return task;
      });

      return updatedTasks;
    });
    setHasChanges(true);
  };

  const handleEventDragStart = (e, task) => {
    setDraggedEvent(task);
    e.dataTransfer.setData("text/plain", "");
  };

  const handleEventDragOver = (e) => {
    e.preventDefault();
    if (!draggedEvent) return;
  };

  const handleEventDrop = (e) => {
    e.preventDefault();
    if (!draggedEvent) return;

    const timelineRect = timelineRef.current.getBoundingClientRect();
    const dropX = e.clientX - timelineRect.left + timelineRef.current.scrollLeft;
    const slotWidth = getTimeSlotWidth();
    const task = draggedEvent;

    let newStart, newEnd;
    const taskPosition = getTaskPosition(task);
    const taskDuration = taskPosition.width / slotWidth;

    switch (viewMode) {
      case "day":
        const newHour = Math.floor(dropX / slotWidth);
        const startDate = new Date(task.startTime);
        const endDate = new Date(task.endDate);
        const hourDiff = endDate.getHours() - startDate.getHours();

        startDate.setHours(newHour);
        endDate.setHours(newHour + hourDiff);

        newStart = startDate.toISOString();
        newEnd = endDate.toISOString();
        break;
      case "week":
        const newDay = Math.floor(dropX / slotWidth) + 1; // +1 because days are 1-indexed (Monday = 1)
        const weekStartDate = new Date(task.startTime);
        const weekEndDate = new Date(task.endDate);
        const dayDiff =
          (new Date(task.endDate).getDay() || 7) - (new Date(task.startTime).getDay() || 7);

        weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay() + newDay);
        weekEndDate.setDate(weekEndDate.getDate() - weekEndDate.getDay() + (newDay + dayDiff));

        newStart = weekStartDate.toISOString();
        newEnd = weekEndDate.toISOString();
        break;
      case "month":
        const newDate = Math.floor(dropX / slotWidth) + 1;
        const monthStartDate = new Date(task.startTime);
        const monthEndDate = new Date(task.endDate);
        const dateDiff = monthEndDate.getDate() - monthStartDate.getDate();

        monthStartDate.setDate(newDate);
        monthEndDate.setDate(newDate + dateDiff);

        newStart = monthStartDate.toISOString();
        newEnd = monthEndDate.toISOString();
        break;
      default:
        return;
    }

    updateTaskTimes(task.id, newStart, newEnd);
    setDraggedEvent(null);
  };

  const handleResizeStart = (e, task, type) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeType(type);
    setResizingEvent(task);
    setStartX(e.clientX);

    const pos = getTaskPosition(task);
    setInitialPosition(pos.left);
    setInitialWidth(pos.width);
  };

  const handleResizeMove = (e) => {
    if (!isResizing || !resizingEvent) return;

    const deltaX = e.clientX - startX;
    const slotWidth = getTimeSlotWidth();
    const task = resizingEvent;

    let newStart = new Date(task.startTime);
    let newEnd = new Date(task.endDate);

    if (resizeType === "start") {
      // Calculate new start time based on resize
      switch (viewMode) {
        case "day":
          const newStartHour = Math.max(
            0,
            Math.min(Math.floor((initialPosition + deltaX) / slotWidth), newEnd.getHours() - 1)
          );
          newStart.setHours(newStartHour);
          break;
        case "week":
          const newStartDay = Math.max(
            1,
            Math.min(
              Math.floor((initialPosition + deltaX) / slotWidth) + 1,
              (newEnd.getDay() || 7) - 1
            )
          );
          const currentDay = newStart.getDay() || 7;
          newStart.setDate(newStart.getDate() + (newStartDay - currentDay));
          break;
        case "month":
          const newStartDate = Math.max(
            1,
            Math.min(Math.floor((initialPosition + deltaX) / slotWidth) + 1, newEnd.getDate() - 1)
          );
          newStart.setDate(newStartDate);
          break;
      }
    } else if (resizeType === "end") {
      // Calculate new end time based on resize
      switch (viewMode) {
        case "day":
          const newEndHour = Math.max(
            newStart.getHours() + 1,
            Math.min(Math.floor((initialPosition + initialWidth + deltaX) / slotWidth), 24)
          );
          newEnd.setHours(newEndHour);
          break;
        case "week":
          const newEndDay = Math.max(
            (newStart.getDay() || 7) + 1,
            Math.min(Math.floor((initialPosition + initialWidth + deltaX) / slotWidth) + 1, 7)
          );
          const currentDay = newEnd.getDay() || 7;
          newEnd.setDate(newEnd.getDate() + (newEndDay - currentDay));
          break;
        case "month":
          const newEndDate = Math.max(
            newStart.getDate() + 1,
            Math.min(Math.floor((initialPosition + initialWidth + deltaX) / slotWidth) + 1, 31)
          );
          newEnd.setDate(newEndDate);
          break;
      }
    }

    updateTaskTimes(task.id, newStart.toISOString(), newEnd.toISOString());
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizingEvent(null);
    setResizeType(null);
  };

  const handleZoom = (direction) => {
    setZoomLevel((prev) => {
      const newZoom = direction === "in" ? Math.min(prev + 20, 200) : Math.max(prev - 20, 60);
      return newZoom;
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        handleResizeMove(e);
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        handleResizeEnd();
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, resizingEvent, resizeType, initialWidth, initialPosition, startX]);

  useEffect(() => {
    // Adjust container width based on timeline content
    if (containerRef.current && timelineRef.current) {
      const timelineSlots = generateTimeSlots().length;
      const width = timelineSlots * getTimeSlotWidth();
      containerRef.current.style.width = `${width}px`;
    }
  }, [zoomLevel, viewMode]);
  // Add this handler to manage task selection
  const handleTaskClick = (e, task) => {
    e.stopPropagation(); // Prevent triggering drag/resize
    setSelectedTask(task);
  };

  // Add this function to handle saving changes from the panel
  const handleSaveTaskDetails = (startHour, startMinute, endHour, endMinute) => {
    if (!selectedTask) return;

    // Create new date objects based on the original dates
    const newStartDate = new Date(selectedTask.startTime);
    const newEndDate = new Date(selectedTask.endDate);

    // Update only the time portion
    newStartDate.setHours(startHour, startMinute);
    newEndDate.setHours(endHour, endMinute);

    updateTaskTimes(selectedTask.id, newStartDate.toISOString(), newEndDate.toISOString());
    setSelectedTask(null); // Close the panel after saving
  };

  // Add this function to handle close button click
  const handleCloseDetails = () => {
    setSelectedTask(null);
  };

  const getHours = (dateString) => {
    return new Date(dateString).getHours();
  };

  const getMinutes = (dateString) => {
    return new Date(dateString).getMinutes();
  };

  const formatTimeForDisplay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  const currentTasks = tasks[viewMode] || [];
  //newcosde
  // Add these handler functions to your TimelineScale component
  const handleSaveTaskDayDetails = (startHour, startMinute, endHour, endMinute) => {
    if (!selectedTask) return;

    // Create new date objects based on the original dates
    const newStartDate = new Date(selectedTask.startTime);
    const newEndDate = new Date(selectedTask.endDate);

    // Update only the time portion
    newStartDate.setHours(startHour, startMinute);
    newEndDate.setHours(endHour, endMinute);

    updateTaskTimes(selectedTask.id, newStartDate.toISOString(), newEndDate.toISOString());
    setSelectedTask(null); // Close the panel after saving
  };

  // Handler for saving weekly timeframe changes
  const handleSaveTaskWeekDetails = (startDay, endDay) => {
    if (!selectedTask) return;

    // Create new date objects based on the original dates
    const newStartDate = new Date(selectedTask.startTime);
    const newEndDate = new Date(selectedTask.endDate);

    // Get the current day of the week (0-6, with 0 being Sunday)
    const currentStartDay = newStartDate.getDay() || 7; // Convert Sunday (0) to 7
    const currentEndDay = newEndDate.getDay() || 7;

    // Calculate day difference to adjust the date
    const startDayDiff = startDay - currentStartDay;
    const endDayDiff = endDay - currentEndDay;

    // Adjust dates based on the selected days
    newStartDate.setDate(newStartDate.getDate() + startDayDiff);
    newEndDate.setDate(newEndDate.getDate() + endDayDiff);

    updateTaskTimes(selectedTask.id, newStartDate.toISOString(), newEndDate.toISOString());
    setSelectedTask(null); // Close the panel after saving
  };

  // Handler for saving monthly timeframe changes
  const handleSaveTaskMonthDetails = (startDate, endDate) => {
    if (!selectedTask) return;

    // Create new date objects based on the original dates
    const newStartDate = new Date(selectedTask.startTime);
    const newEndDate = new Date(selectedTask.endDate);

    // Set the new dates while preserving the current month and year
    newStartDate.setDate(startDate);
    newEndDate.setDate(endDate);

    updateTaskTimes(selectedTask.id, newStartDate.toISOString(), newEndDate.toISOString());
    setSelectedTask(null); // Close the panel after saving
  };

  return (
    <div className="timeline-container">
      <div className="controls">
        <div className="view-controls">
          {["day", "week", "month"].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`view-button ${viewMode === mode ? "active" : ""}`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        <div className="zoom-controls">
          <button
            onClick={() => handleZoom("out")}
            className="zoom-button"
            disabled={zoomLevel <= 60}
          >
            -
          </button>
          <button
            onClick={() => handleZoom("in")}
            className="zoom-button"
            disabled={zoomLevel >= 200}
          >
            +
          </button>
          {hasChanges && (
            <button onClick={saveChanges} className="save-button">
              Save Changes5
            </button>
          )}
        </div>
      </div>
      <div
        className="timeline"
        ref={timelineRef}
        onDragOver={handleEventDragOver}
        onDrop={handleEventDrop}
      >
        <div className="timeline-header">
          <div className="timeline-slots">
            {generateTimeSlots().map((timeSlot, index) => (
              <div key={index} className="time-slot" style={{ width: `${getTimeSlotWidth()}px` }}>
                {timeSlot}
              </div>
            ))}
          </div>
        </div>

        <div ref={containerRef} className="timeline-content">
          {currentTasks.map((task) => {
            const position = getTaskPosition(task);
            const progressPercentage = getProgressPercentage(task);
            const taskColor = getTaskColor(task.id);
            return (
              <div key={task.id} className="event-row">
                <div
                  draggable={!isResizing}
                  onDragStart={(e) => handleEventDragStart(e, task)}
                  onClick={(e) => handleTaskClick(e, task)}
                  style={{
                    left: `${position.left}px`,
                    width: `${position.width}px`,
                  }}
                  className="event-item"
                  title={`${task.name} (${progressPercentage.toFixed(0)}% complete)`}
                >
                  {/* Keep the existing content inside this div */}
                  <div className="event-background" style={{ backgroundColor: taskColor }} />
                  <div
                    className="event-progress"
                    style={{
                      backgroundColor: taskColor, // Change from task.color to taskColor
                      width: `${progressPercentage}%`,
                      opacity: 0.7, // Add opacity to distinguish it from the background
                    }}
                  />
                  <div
                    className="resize-handle left"
                    onMouseDown={(e) => handleResizeStart(e, task, "start")}
                  >
                    <div className="resize-icon">
                      <GripVertical size={12} style={{ color: "#4b5563" }} />
                    </div>
                  </div>
                  <span className="event-title">
                    {task.name}({progressPercentage.toFixed(0)}%)
                  </span>
                  <div
                    className="resize-handle right"
                    onMouseDown={(e) => handleResizeStart(e, task, "end")}
                  >
                    <div className="resize-icon">
                      <GripVertical size={12} style={{ color: "#4b5563" }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="timeline-footer">
        Drag tasks to reposition them. Drag edges to resize tasks. Use zoom controls to adjust the
        timeline scale. Click &quot;Save Changes&quot; to save task updates.
      </div>
      {selectedTask && (
        <TaskDetailPanel
          selectedTask={selectedTask}
          viewMode={viewMode}
          onClose={handleCloseDetails}
          onSaveDay={handleSaveTaskDayDetails}
          onSaveWeek={handleSaveTaskWeekDetails}
          onSaveMonth={handleSaveTaskMonthDetails}
          getHours={getHours}
          getMinutes={getMinutes}
          getProgressPercentage={getProgressPercentage}
        />
      )}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            style: {
              background: "#4CAF50",
            },
          },
          error: {
            style: {
              background: "#F44336",
            },
          },
        }}
      />
    </div>
  );
};

export default TimelineScale;
