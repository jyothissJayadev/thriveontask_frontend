// TimelineScale.jsx
import React, { useState, useRef, useEffect } from "react";
import { GripVertical } from "lucide-react";
import "./TimelineScale.css";

const TimelineScale = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Task 1",
      start: "01:00",
      end: "07:00",
      color: "#3b82f6",
      progress: 45,
    },
    {
      id: 2,
      title: "Task 2",
      start: "06:00",
      end: "08:00",
      color: "#22c55e",
      progress: 80,
    },
    {
      id: 3,
      title: "Task 3",
      start: "14:00",
      end: "17:00",
      color: "#a855f7",
      progress: 30,
    },
    {
      id: 4,
      title: "Task 4",
      start: "09:00",
      end: "11:00",
      color: "#f43f5e",
      progress: 60,
    },
    {
      id: 5,
      title: "Task 5",
      start: "13:00",
      end: "16:00",
      color: "#f59e0b",
      progress: 25,
    },
  ]);

  const [isResizing, setIsResizing] = useState(false);
  const [resizeType, setResizeType] = useState(null);
  const [startX, setStartX] = useState(0);
  const [viewMode, setViewMode] = useState("day");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [resizingEvent, setResizingEvent] = useState(null);
  const [initialWidth, setInitialWidth] = useState(0);
  const [initialPosition, setInitialPosition] = useState(0);
  const timelineRef = useRef(null);
  const containerRef = useRef(null);

  const cellWidth = zoomLevel;

  const formatDate = (date) => {
    switch (viewMode) {
      case "week":
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      case "month":
        return date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      default:
        return date;
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
        const days = [];
        const startDate = new Date();
        for (let i = 0; i < 30; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          days.push(formatDate(date));
        }
        return days;
      case "month":
        const months = [];
        const startMonth = new Date();
        for (let i = 0; i < 12; i++) {
          const date = new Date(startMonth);
          date.setDate(1);
          date.setMonth(startMonth.getMonth() + i);
          months.push(formatDate(date));
        }
        return months;
      default:
        return [];
    }
  };

  const getEventPosition = (event) => {
    const startHour = parseInt(event.start.split(":")[0]);
    const endHour = parseInt(event.end.split(":")[0]);
    const duration = endHour - startHour;
    const left = startHour * cellWidth;
    const width = duration * cellWidth;
    return { left: `${left}px`, width: `${width}px` };
  };

  const handleZoom = (direction) => {
    setZoomLevel((prev) => {
      const newZoom = direction === "in" ? Math.min(prev + 20, 200) : Math.max(prev - 20, 60);
      return newZoom;
    });
  };

  const handleEventDragStart = (e, event) => {
    setDraggedEvent(event);
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
    const newStartHour = Math.floor(dropX / cellWidth);

    const duration =
      parseInt(draggedEvent.end.split(":")[0]) - parseInt(draggedEvent.start.split(":")[0]);
    const newEndHour = Math.min(newStartHour + duration, 24);

    const updatedEvents = events.map((event) => {
      if (event.id === draggedEvent.id) {
        return {
          ...event,
          start: `${newStartHour.toString().padStart(2, "0")}:00`,
          end: `${newEndHour.toString().padStart(2, "0")}:00`,
        };
      }
      return event;
    });

    setEvents(updatedEvents);
    setDraggedEvent(null);
  };

  const handleResizeStart = (e, event, type) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeType(type);
    setResizingEvent(event);
    setStartX(e.clientX);

    const pos = getEventPosition(event);
    setInitialPosition(parseInt(pos.left));
    setInitialWidth(parseInt(pos.width));
  };

  const handleResizeMove = (e) => {
    if (!isResizing || !resizingEvent) return;

    const deltaX = e.clientX - startX;

    const updatedEvents = events.map((event) => {
      if (event.id === resizingEvent.id) {
        let newStart = parseInt(event.start);
        let newEnd = parseInt(event.end);

        if (resizeType === "start") {
          const newStartHour = Math.max(
            0,
            Math.min(Math.floor((initialPosition + deltaX) / cellWidth), parseInt(event.end) - 1)
          );
          newStart = newStartHour;
        } else if (resizeType === "end") {
          const newEndHour = Math.max(
            parseInt(event.start) + 1,
            Math.min(Math.floor((initialPosition + initialWidth + deltaX) / cellWidth), 24)
          );
          newEnd = newEndHour;
        }

        return {
          ...event,
          start: `${newStart.toString().padStart(2, "0")}:00`,
          end: `${newEnd.toString().padStart(2, "0")}:00`,
        };
      }
      return event;
    });

    setEvents(updatedEvents);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizingEvent(null);
    setResizeType(null);
  };

  const handleAddEvent = () => {
    const colors = ["#3b82f6", "#22c55e", "#a855f7", "#f43f5e", "#f59e0b"];
    const newEvent = {
      id: Date.now(),
      title: `Task ${events.length + 1}`,
      start: "09:00",
      end: "12:00",
      color: colors[events.length % colors.length],
      progress: Math.floor(Math.random() * 100),
    };
    setEvents([...events, newEvent]);
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
    if (containerRef.current && timelineRef.current) {
      const width = timelineRef.current.scrollWidth;
      containerRef.current.style.width = `${width}px`;
    }
  }, [zoomLevel, viewMode]);

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
          <button onClick={handleAddEvent} className="add-event-button">
            Add Event
          </button>
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
              <div key={index} className="time-slot" style={{ width: `${cellWidth}px` }}>
                {timeSlot}
              </div>
            ))}
          </div>
        </div>

        <div ref={containerRef}>
          {events.map((event) => (
            <div key={event.id} className="event-row">
              <div
                draggable={!isResizing}
                onDragStart={(e) => handleEventDragStart(e, event)}
                style={{
                  ...getEventPosition(event),
                }}
                className="event-item"
                title={`${event.title} (${event.start} - ${event.end})`}
              >
                <div className="event-background" style={{ backgroundColor: event.color }} />
                <div
                  className="event-progress"
                  style={{
                    backgroundColor: event.color,
                    width: `${event.progress}%`,
                  }}
                />
                <div
                  className="resize-handle left"
                  onMouseDown={(e) => handleResizeStart(e, event, "start")}
                >
                  <div className="resize-icon">
                    <GripVertical size={12} style={{ color: "#4b5563" }} />
                  </div>
                </div>
                <span className="event-title">
                  {event.title} ({event.progress}%)
                </span>
                <div
                  className="resize-handle right"
                  onMouseDown={(e) => handleResizeStart(e, event, "end")}
                >
                  <div className="resize-icon">
                    <GripVertical size={12} style={{ color: "#4b5563" }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="timeline-footer">
        Drag events to reposition them. Drag edges to resize events. Use zoom controls to adjust the
        timeline scale.
      </div>
    </div>
  );
};

export default TimelineScale;
