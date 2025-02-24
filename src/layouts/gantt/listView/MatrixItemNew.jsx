import React, { useState } from "react";
import PropTypes from "prop-types"; // Import PropTypes
import { ChevronRight, MoreHorizontal } from "lucide-react"; // Add MoreHorizontal (3-dot) icon
import "./MatrixItemNew.css";

const MatrixItemNew = ({ item, onEdit }) => {
  const [expandedItem, setExpandedItem] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [startTime, setStartTime] = useState(item.startTime || "");
  const [endTime, setEndTime] = useState(item.endTime || "");

  const toggleExpand = () => {
    setExpandedItem(!expandedItem);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onEdit(item.id, startTime, endTime); // Callback to parent component to save changes
    setIsEditing(false);
  };

  const handleCancel = () => {
    setStartTime(item.startTime || "");
    setEndTime(item.endTime || "");
    setIsEditing(false);
  };

  return (
    <div className="matrix-item-new">
      <div className="matrix-item-new-header" onClick={toggleExpand}>
        <div className="matrix-item-new-content">
          <div className="matrix-item-new-date">{item.date}</div>
          <h3 className="matrix-item-new-title">{item.title}</h3>
        </div>
        <div className={`matrix-item-new-icon ${expandedItem ? "rotated" : ""}`}>
          <ChevronRight />
        </div>
        <div className="matrix-item-new-menu">
          <MoreHorizontal onClick={handleEditClick} />
        </div>
      </div>

      {isEditing ? (
        <div className="matrix-item-edit-form">
          <div>
            <label>Start Time:</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <label>End Time:</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <button onClick={handleSave}>Save</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      ) : (
        <div className={`matrix-item-new-details ${expandedItem ? "expanded" : ""}`}>
          <p>{item.details}</p>
        </div>
      )}
    </div>
  );
};

// PropTypes validation
MatrixItemNew.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    date: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    details: PropTypes.string.isRequired,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func.isRequired, // Function to handle editing item
};

export default MatrixItemNew;
