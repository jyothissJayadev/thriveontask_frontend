import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Move,
  GripVertical,
  Search,
  X,
  MoreVertical,
  Trash2,
} from "lucide-react";
import "./HierarchicalList.css";

const HierarchicalList = () => {
  const [items, setItems] = useState([
    {
      id: 1,
      title: "Lorem ipsum dolor",
      subtitle: "Lorem ipsum dolor sit amet.",
      selected: false,
      expanded: false,
      duration: "2h 30m",
      timeframe: "Weekly",
      color: "#f3f4f6",
      units: 2,
      children: [],
    },
    {
      id: 2,
      title: "Lorem ipsum dolor",
      subtitle: "Lorem ipsum dolor sit amet.",
      selected: true,
      expanded: false,
      duration: "1h 45m",
      timeframe: "Daily",
      color: "#dbeafe",
      units: 3,
      children: [],
    },
    {
      id: 3,
      title: "Lorem ipsum dolor",
      subtitle: "Lorem ipsum dolor sit amet.",
      selected: false,
      expanded: false,
      duration: "3h 15m",
      timeframe: "Monthly",
      color: "#e0f2fe",
      units: 1,
      children: [],
    },
  ]);
  const [lastId, setLastId] = useState(3);
  const [showSearchContainer, setShowSearchContainer] = useState(false);
  const [showColorUnitForm, setShowColorUnitForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addingToParentId, setAddingToParentId] = useState(null);
  const [selectedSearchItem, setSelectedSearchItem] = useState(null);
  const [colorSelection, setColorSelection] = useState("#f3f4f6");
  const [unitSelection, setUnitSelection] = useState(1);

  // New states for menu and confirmation dialog
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Sample data array for search
  const availableItems = [
    { id: 101, name: "Marketing Strategy", duration: "4h 30m", timeframe: "Weekly" },
    { id: 102, name: "Content Creation", duration: "2h 15m", timeframe: "Daily" },
    { id: 103, name: "Financial Review", duration: "1h 45m", timeframe: "Monthly" },
    { id: 104, name: "Team Meeting", duration: "1h 00m", timeframe: "Weekly" },
    { id: 105, name: "Customer Support", duration: "3h 00m", timeframe: "Daily" },
    { id: 106, name: "Product Development", duration: "5h 30m", timeframe: "Weekly" },
    { id: 107, name: "Research Analysis", duration: "2h 30m", timeframe: "Monthly" },
    { id: 108, name: "Sales Report", duration: "1h 15m", timeframe: "Weekly" },
  ];

  // Color options
  const colorOptions = [
    { value: "#f3f4f6", label: "Light Gray" },
    { value: "#dbeafe", label: "Light Blue" },
    { value: "#e0f2fe", label: "Sky Blue" },
    { value: "#dcfce7", label: "Light Green" },
    { value: "#fef9c3", label: "Light Yellow" },
    { value: "#fee2e2", label: "Light Red" },
    { value: "#f5d0fe", label: "Light Purple" },
    { value: "#fce7f3", label: "Light Pink" },
  ];

  const toggleExpand = (id) => {
    const updateExpanded = (items) => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, expanded: !item.expanded };
        } else if (item.children?.length > 0) {
          return { ...item, children: updateExpanded(item.children) };
        }
        return item;
      });
    };
    setItems(updateExpanded(items));
  };

  const toggleSelect = (id) => {
    const updateSelected = (items) => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, selected: !item.selected };
        } else if (item.children?.length > 0) {
          return { ...item, children: updateSelected(item.children) };
        }
        return item;
      });
    };
    setItems(updateSelected(items));
  };

  const handleAddButtonClick = (parentId = null) => {
    setAddingToParentId(parentId);
    setShowSearchContainer(true);
    setSearchQuery("");
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredItems = availableItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchItemClick = (selectedItem) => {
    setSelectedSearchItem(selectedItem);
    setShowSearchContainer(false);
    setShowColorUnitForm(true);

    // Set default color based on parent if adding a child
    if (addingToParentId !== null) {
      const findParentColor = (items, id) => {
        for (const item of items) {
          if (item.id === id) {
            return item.color;
          }
          if (item.children?.length > 0) {
            const childResult = findParentColor(item.children, id);
            if (childResult) return childResult;
          }
        }
        return null;
      };

      const parentColor = findParentColor(items, addingToParentId);
      if (parentColor) {
        setColorSelection(parentColor);
      }
    } else {
      // Default color for new parent items
      setColorSelection("#f3f4f6");
    }

    setUnitSelection(1);
  };

  const handleColorUnitSubmit = () => {
    const newId = lastId + 1;
    setLastId(newId);

    const newItem = {
      id: newId,
      title: selectedSearchItem.name,
      subtitle: `${selectedSearchItem.duration} - ${selectedSearchItem.timeframe}`,
      selected: false,
      expanded: false,
      duration: selectedSearchItem.duration,
      timeframe: selectedSearchItem.timeframe,
      color: colorSelection,
      units: unitSelection,
      children: [],
    };

    if (addingToParentId === null) {
      // Adding as a parent item
      setItems([...items, newItem]);
    } else {
      // Adding as a child item - inherit parent's color
      const addChildToParent = (items) => {
        return items.map((item) => {
          if (item.id === addingToParentId) {
            return {
              ...item,
              children: [...item.children, newItem],
              expanded: true, // auto-expand parent when adding child
            };
          } else if (item.children?.length > 0) {
            return { ...item, children: addChildToParent(item.children) };
          }
          return item;
        });
      };

      setItems(addChildToParent(items));
    }

    // Close the color/unit form
    setShowColorUnitForm(false);
    setSelectedSearchItem(null);
  };

  // Function to toggle the menu for an item
  const toggleMenu = (id, e) => {
    e.stopPropagation();
    if (openMenuId === id) {
      setOpenMenuId(null);
    } else {
      setOpenMenuId(id);
    }
  };

  // Function to start the delete process
  const handleDeleteClick = (item, e) => {
    e.stopPropagation();
    setItemToDelete(item);
    setShowDeleteConfirmation(true);
    setOpenMenuId(null);
  };

  // Function to cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setItemToDelete(null);
  };

  // Function to confirm delete
  const confirmDelete = () => {
    const removeItem = (items, idToRemove) => {
      // Filter out the item at the current level
      const filteredItems = items.filter((item) => item.id !== idToRemove);

      // If we still have the same number of items, search in children
      if (filteredItems.length === items.length) {
        return items.map((item) => {
          if (item.children?.length > 0) {
            return { ...item, children: removeItem(item.children, idToRemove) };
          }
          return item;
        });
      }

      return filteredItems;
    };

    setItems(removeItem(items, itemToDelete.id));
    setShowDeleteConfirmation(false);
    setItemToDelete(null);
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuId !== null) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openMenuId]);

  const renderItem = (item, depth = 0, parentColor = null) => {
    // Use the item's color or inherit from parent
    const bgColor = item.color || parentColor || "#ffffff";

    return (
      <div key={item.id} className="item-wrapper">
        <div
          className={`item-row ${item.selected ? "selected" : ""}`}
          style={{ backgroundColor: bgColor }}
        >
          {/* Numbered circle on the left (only for top-level items) */}
          {depth === 0 && (
            <div className="item-number">
              <div className="number-circle">{item.id}</div>
            </div>
          )}

          {/* Icon and expand/collapse button */}
          <div className="icon-section">
            {depth > 0 && <div className="depth-spacer" style={{ width: `${depth * 24}px` }}></div>}
            <div className="avatar-container">
              <div className="avatar">A</div>
            </div>
            {item.children.length > 0 && (
              <button onClick={() => toggleExpand(item.id)} className="expand-button">
                {item.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
          </div>

          {/* Content */}
          <div className="content-section">
            <div className="content-row">
              <span className="item-title">{item.title}</span>
              <span className="item-duration">{item.duration}</span>
            </div>
            <div className="content-row">
              <span className="item-subtitle">{item.subtitle}</span>
              <span className="item-units">Units: {item.units}</span>
            </div>
          </div>

          {/* Actions on the right */}
          <div className="actions-section">
            {/* New 3-dot menu button */}
            <div className="menu-button" onClick={(e) => toggleMenu(item.id, e)}>
              <MoreVertical size={16} />

              {/* Dropdown menu */}
              {openMenuId === item.id && (
                <div className="dropdown-menu">
                  <div className="dropdown-item delete" onClick={(e) => handleDeleteClick(item, e)}>
                    <Trash2 size={16} className="dropdown-item-icon" />
                    <span>Delete</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => handleAddButtonClick(item.id)}
              className="action-button add"
              title="Add child item"
            >
              <Plus size={16} />
            </button>
            <button className="action-button">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {item.expanded && item.children?.length > 0 && (
          <div className="children-container">
            {item.children.map((child) => renderItem(child, depth + 1, item.color))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="hierarchical-list-container">
      <div className="items-container">{items.map((item) => renderItem(item))}</div>

      {/* Add button for adding new parent items */}
      <div className="add-parent-container">
        <button onClick={() => handleAddButtonClick(null)} className="add-parent-button">
          <span className="add-button-text">ADD</span>
          <Plus size={20} />
        </button>
      </div>

      {/* Search container */}
      {showSearchContainer && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">Add Item</h3>
              <button onClick={() => setShowSearchContainer(false)} className="close-button">
                <X size={20} />
              </button>
            </div>

            <div className="search-container">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search items..."
                className="search-input"
              />
              <Search size={18} className="search-icon" />
            </div>

            <div className="search-results">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSearchItemClick(item)}
                    className="search-item"
                  >
                    <div className="search-item-header">
                      <span className="search-item-name">{item.name}</span>
                      <span className="search-item-duration">{item.duration}</span>
                    </div>
                    <div className="search-item-timeframe">{item.timeframe}</div>
                  </div>
                ))
              ) : (
                <p className="no-results">No items found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Color and Unit Selection Form */}
      {showColorUnitForm && selectedSearchItem && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">Configure Item</h3>
              <button onClick={() => setShowColorUnitForm(false)} className="close-button">
                <X size={20} />
              </button>
            </div>

            <div className="configure-item-section">
              <h4 className="item-details">{selectedSearchItem.name}</h4>
              <p className="item-details-info">
                {selectedSearchItem.duration} - {selectedSearchItem.timeframe}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Select Color</label>
              <div className="color-grid">
                {colorOptions.map((color) => (
                  <div
                    key={color.value}
                    onClick={() => setColorSelection(color.value)}
                    className={`color-option ${colorSelection === color.value ? "selected" : ""}`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  ></div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Number of Units</label>
              <input
                type="number"
                min="1"
                max="10"
                value={unitSelection}
                onChange={(e) => setUnitSelection(parseInt(e.target.value) || 1)}
                className="unit-input"
              />
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowColorUnitForm(false)} className="cancel-button">
                Cancel
              </button>
              <button onClick={handleColorUnitSubmit} className="submit-button">
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && itemToDelete && (
        <div className="modal-overlay">
          <div className="modal-container confirmation-dialog">
            <div className="modal-header">
              <h3 className="confirmation-title">Delete Item</h3>
              <button onClick={cancelDelete} className="close-button">
                <X size={20} />
              </button>
            </div>

            <div className="confirmation-message">
              Are you sure you want to delete &quot; {itemToDelete.title}&quot;?
              {itemToDelete.children.length > 0 && (
                <span> This will also delete all its child items.</span>
              )}
            </div>

            <div className="confirmation-buttons">
              <button onClick={cancelDelete} className="confirmation-cancel">
                Cancel
              </button>
              <button onClick={confirmDelete} className="confirmation-delete">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HierarchicalList;
