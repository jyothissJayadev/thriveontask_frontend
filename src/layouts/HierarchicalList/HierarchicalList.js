import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Plus, Search, X, Trash2 } from "lucide-react";
import "./HierarchicalList.css";
import {
  getCategories,
  createCategory,
  deleteCategory,
  getTasks,
  updateChildInCategory,
  deleteChildTasksCategory,
} from "../../api/api";
import toast, { Toaster } from "react-hot-toast";
const HierarchicalList = () => {
  const [items, setItems] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [lastId, setLastId] = useState(3);
  const [showSearchContainer, setShowSearchContainer] = useState(false);
  const [showColorUnitForm, setShowColorUnitForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addingToParentId, setAddingToParentId] = useState(null);
  const [selectedSearchItem, setSelectedSearchItem] = useState(null);
  const [colorSelection, setColorSelection] = useState("#f3f4f6");
  const [unitSelection, setUnitSelection] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRemoveChildConfirmation, setShowRemoveChildConfirmation] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  // New states for menu and confirmation dialog
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [parentTimeframe, setParentTimeframe] = useState(null);
  // Mock token - In a real app, you would get this from your auth system
  const token = localStorage.getItem("jwtToken");

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

  // Fetch categories and tasks on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesResponse, tasksResponse] = await Promise.all([
          getCategories(token),
          getTasks(token),
        ]);

        if (categoriesResponse.success) {
          // In your useEffect function where you format categories from API response:
          const formattedCategories = categoriesResponse.categories.map((category) => ({
            id: category._id,
            title: category.name,
            subtitle: category.parent_task
              ? `Parent: ${category.parent_task.taskName}`
              : "No parent task",
            selected: false,
            expanded: false,
            duration: category.parent_task
              ? calculateDuration(category.parent_task.createdAt, category.parent_task.endDate)
              : "N/A",
            // Extract timeframe from parent_task
            timeframe: category.parent_task ? category.parent_task.timeframe : "N/A",
            color: category.color || "#f3f4f6",
            units: category.children ? category.children.length : 0,
            children: category.children
              ? category.children.map((child) => ({
                  id: child._id,
                  title: child.taskName,
                  subtitle: `Units: ${child.completedUnits}/${child.numberOfUnits}`,
                  selected: false,
                  expanded: false,
                  duration: calculateDuration(child.createdAt, child.endDate),
                  timeframe: child.timeframe || "N/A",
                  color: category.color || "#f3f4f6",
                  units: child.numberOfUnits || 0,
                  children: [],
                  taskId: child._id,
                  isTask: true,
                }))
              : [],
            parentTaskId: category.parent_task ? category.parent_task._id : null,
          }));

          setItems(formattedCategories);
        } else {
          const errorMessage = categoriesResponse?.error || "Failed to fetch categories";
          setError(errorMessage);
          toast.error(errorMessage);
        }

        if (tasksResponse.success) {
          const formattedTasks = tasksResponse.tasks
            .filter((task) => task.priority !== 0) // Filter out tasks with priority=0
            .map((task) => ({
              id: task._id,
              name: task.taskName,
              duration: calculateDuration(task.createdAt, task.endDate),
              timeframe: task.timeframe || "N/A",
              numberOfUnits: task.numberOfUnits,
              completedUnits: task.completedUnits,
              color: task.color || "#f3f4f6",
              priority: task.priority, // Make sure to include priority
              isTask: true,
            }));

          setAvailableTasks(formattedTasks);
        } else {
          const errorMessage = tasksResponse?.error || "Failed to fetch tasks";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } catch (err) {
        const errorMessage = err?.response?.data?.error || "An error occurred while fetching data";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to calculate duration from dates
  const calculateDuration = (startDate, endDate) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffInHours = Math.abs(end - start) / 36e5;

      if (diffInHours < 1) {
        return `${Math.round(diffInHours * 60)}m`;
      } else {
        const hours = Math.floor(diffInHours);
        const minutes = Math.round((diffInHours - hours) * 60);
        return `${hours}h ${minutes > 0 ? minutes + "m" : ""}`;
      }
    } catch (err) {
      return "N/A";
    }
  };

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
  const filterTasksByTimeframeHierarchy = (tasks, parentTimeframe) => {
    if (!parentTimeframe) return tasks;

    // Define the hierarchy in correct order (month > week > day)
    const timeframeHierarchy = ["month", "week", "day"];
    const parentLevel = timeframeHierarchy.indexOf(parentTimeframe.toLowerCase());

    if (parentLevel === -1) return tasks; // If parent timeframe not in hierarchy, show all

    return tasks.filter((task) => {
      const taskTimeframe = task.timeframe ? task.timeframe.toLowerCase() : "";
      const taskLevel = timeframeHierarchy.indexOf(taskTimeframe);

      // Only show tasks with timeframe equal to or below parent in hierarchy
      return taskLevel !== -1 && taskLevel >= parentLevel;
    });
  };

  const handleAddButtonClick = (parentId = null) => {
    setAddingToParentId(parentId);

    // Find parent's timeframe if adding to a parent
    if (parentId) {
      const findParentTimeframe = (items, id) => {
        for (const item of items) {
          if (item.id === id) {
            console.log("Found parent:", item); // Debug log
            return item.timeframe;
          }
          if (item.children?.length > 0) {
            const result = findParentTimeframe(item.children, id);
            if (result) return result;
          }
        }
        return null;
      };

      const timeframe = findParentTimeframe(items, parentId);
      console.log("Parent timeframe found:", timeframe); // Debug log

      // If timeframe is undefined or "N/A", try to find it from the parent's parent task
      if (!timeframe || timeframe === "N/A") {
        const parent = items.find((item) => item.id === parentId);
        if (parent && parent.parentTaskId) {
          // Look for the parent task in availableTasks
          const parentTask = availableTasks.find((task) => task.id === parent.parentTaskId);
          if (parentTask) {
            console.log("Found parent task timeframe:", parentTask.timeframe);
            setParentTimeframe(parentTask.timeframe);
          } else {
            setParentTimeframe(null);
          }
        } else {
          setParentTimeframe(null);
        }
      } else {
        setParentTimeframe(timeframe);
      }
    } else {
      setParentTimeframe(null);
    }

    setShowSearchContainer(true);
    setSearchQuery("");
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Update the filteredItems calculation to filter out tasks with priority=0
  const filteredItems = filterTasksByTimeframeHierarchy(
    availableTasks
      .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter((item) => item.priority !== 0), // Filter out tasks with priority=0
    parentTimeframe
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

  const handleColorUnitSubmit = async () => {
    try {
      if (addingToParentId === null) {
        // Creating a new category with the selected task as parent
        const result = await createCategory(
          selectedSearchItem.name, // name
          `Category for ${selectedSearchItem.name}`, // description
          selectedSearchItem.id, // parent_task
          [], // children (empty initially)
          colorSelection, // color
          token
        );

        if (result.success) {
          toast.success("Category created successfully");
          // Refresh categories after successful creation
          const categoriesResponse = await getCategories(token);
          if (categoriesResponse.success) {
            const formattedCategories = categoriesResponse.categories.map((category) => ({
              id: category._id,
              title: category.name,
              subtitle: category.parent_task
                ? `Parent: ${category.parent_task.taskName}`
                : "No parent task",
              selected: false,
              expanded: false,
              duration: category.parent_task
                ? calculateDuration(category.parent_task.createdAt, category.parent_task.endDate)
                : "N/A",
              timeframe: "N/A",
              color: category.color || "#f3f4f6",
              units: category.children ? category.children.length : 0,
              children: category.children
                ? category.children.map((child) => ({
                    id: child._id,
                    title: child.taskName,
                    subtitle: `Units: ${child.completedUnits}/${child.numberOfUnits}`,
                    selected: false,
                    expanded: false,
                    duration: calculateDuration(child.createdAt, child.endDate),
                    timeframe: child.timeframe || "N/A",
                    color: category.color || "#f3f4f6",
                    units: child.numberOfUnits || 0,
                    children: [],
                    taskId: child._id,
                    isTask: true,
                  }))
                : [],
              parentTaskId: category.parent_task ? category.parent_task._id : null,
            }));

            setItems(formattedCategories);
          } else {
            const errorMessage = categoriesResponse?.error || "Failed to refresh categories";
            setError(errorMessage);
            toast.error(errorMessage);
          }
        } else {
          const errorMessage = result?.error || "Failed to create category";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } else {
        // Find the parent category to update
        const findParentCategory = (items, id) => {
          for (const item of items) {
            if (item.id === id) {
              return item;
            }
            if (item.children?.length > 0) {
              const result = findParentCategory(item.children, id);
              if (result) return result;
            }
          }
          return null;
        };

        const parentCategory = findParentCategory(items, addingToParentId);

        if (parentCategory) {
          const result = await updateChildInCategory(
            parentCategory.id, // categoryId
            selectedSearchItem.id, // taskId
            unitSelection, // numberOfUnits
            token
          );
          if (result.success) {
            toast.success("Category updated successfully");
            // Refresh categories after successful update
            const categoriesResponse = await getCategories(token);
            if (categoriesResponse.success) {
              const formattedCategories = categoriesResponse.categories.map((category) => ({
                id: category._id,
                title: category.name,
                subtitle: category.parent_task
                  ? `Parent: ${category.parent_task.taskName}`
                  : "No parent task",
                selected: false,
                expanded: false,
                duration: category.parent_task
                  ? calculateDuration(category.parent_task.createdAt, category.parent_task.endDate)
                  : "N/A",
                timeframe: "N/A",
                color: category.color || "#f3f4f6",
                units: category.children ? category.children.length : 0,
                children: category.children
                  ? category.children.map((child) => ({
                      id: child._id,
                      title: child.taskName,
                      subtitle: `Units: ${child.completedUnits}/${child.numberOfUnits}`,
                      selected: false,
                      expanded: false,
                      duration: calculateDuration(child.createdAt, child.endDate),
                      timeframe: child.timeframe || "N/A",
                      color: category.color || "#f3f4f6",
                      units: child.numberOfUnits || 0,
                      children: [],
                      taskId: child._id,
                      isTask: true,
                    }))
                  : [],
                parentTaskId: category.parent_task ? category.parent_task._id : null,
              }));

              setItems(formattedCategories);
            } else {
              const errorMessage = categoriesResponse?.error || "Failed to refresh categories";
              setError(errorMessage);
              toast.error(errorMessage);
            }
          } else {
            const errorMessage = result?.error || "Failed to update category";
            setError(errorMessage);
            toast.error(errorMessage);
          }
        } else {
          const errorMessage = "Parent category not found";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      }
    } catch (err) {
      const errorMessage = "An error occurred while submitting";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setShowColorUnitForm(false);
      setSelectedSearchItem(null);
    }
  };
  const calculateChildrenProgress = (children) => {
    if (!children || children.length === 0) return 0;

    const totalUnits = children.reduce((sum, child) => sum + (child.numberOfUnits || 0), 0);
    const completedUnits = children.reduce((sum, child) => sum + (child.completedUnits || 0), 0);

    return totalUnits > 0 ? (completedUnits / totalUnits) * 100 : 0;
  };
  const getProgressColor = (progress) => {
    if (progress < 30) return "#ef4444"; // Red
    if (progress < 70) return "#f59e0b"; // Amber
    return "#10b981"; // Green
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
  const handleDeleteParent = (item, e) => {
    e.stopPropagation();
    setItemToDelete(item);
    setShowDeleteConfirmation(true);
  };

  // Function to handle deletion of child from a category
  const handleDeleteChild = (item, e) => {
    e.stopPropagation();
    setItemToRemove(item);
    setShowRemoveChildConfirmation(true);
  };
  // Function to cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setItemToDelete(null);
  };
  const refreshCategories = async () => {
    try {
      const categoriesResponse = await getCategories(token);
      if (categoriesResponse.success) {
        const formattedCategories = categoriesResponse.categories.map((category) => ({
          id: category._id,
          title: category.name,
          subtitle: category.parent_task
            ? `Parent: ${category.parent_task.taskName}`
            : "No parent task",
          selected: false,
          expanded: false,
          duration: category.parent_task
            ? calculateDuration(category.parent_task.createdAt, category.parent_task.endDate)
            : "N/A",
          timeframe: "N/A",
          color: category.color || "#f3f4f6",
          units: category.children ? category.children.length : 0,
          children: category.children
            ? category.children.map((child) => ({
                id: child._id,
                title: child.taskName,
                subtitle: `Units: ${child.completedUnits}/${child.numberOfUnits}`,
                selected: false,
                expanded: false,
                duration: calculateDuration(child.createdAt, child.endDate),
                timeframe: child.timeframe || "N/A",
                color: category.color || "#f3f4f6",
                units: child.numberOfUnits || 0,
                completedUnits: child.completedUnits || 0,
                numberOfUnits: child.numberOfUnits || 0,
                children: [],
                taskId: child._id,
                isTask: true,
              }))
            : [],
          parentTaskId: category.parent_task ? category.parent_task._id : null,
        }));

        setItems(formattedCategories);
      } else {
        const errorMessage = categoriesResponse?.error || "Failed to refresh categories";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to refresh categories");
    }
  };
  const confirmRemoveChild = async () => {
    try {
      // Find the child and its parent
      const findChildAndParent = (items, childId) => {
        for (const item of items) {
          if (item.children) {
            for (const child of item.children) {
              if (child.id === childId) {
                return { child, parent: item };
              }
            }
          }
          if (item.children?.length > 0) {
            const result = findChildAndParent(item.children, childId);
            if (result) return result;
          }
        }
        return { child: null, parent: null };
      };

      const { child, parent } = findChildAndParent(items, itemToRemove.id);

      if (child && parent) {
        // Use the new API function with just categoryId and taskId
        const result = await deleteChildTasksCategory(
          parent.id, // categoryId
          child.taskId, // taskId
          token
        );

        if (result.success) {
          toast.success("Task removed from category successfully");
          refreshCategories();
        } else {
          const errorMessage = result?.error || "Failed to remove task from category";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } else {
        toast.error("Task not found");
      }
    } catch (err) {
      toast.error("An error occurred while removing the task");
      console.error(err);
    } finally {
      setShowRemoveChildConfirmation(false);
      setItemToRemove(null);
    }
  };

  // Function to confirm delete
  const confirmDelete = async () => {
    try {
      // Delete the category using the API
      console.log(itemToDelete);
      const result = await deleteCategory(itemToDelete.id, token);

      if (result.success) {
        toast.success("Category deleted successfully");
        // Remove the item from the local state
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
      } else {
        const errorMessage = result?.error || "Failed to delete category";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = "An error occurred while deleting";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setShowDeleteConfirmation(false);
      setItemToDelete(null);
    }
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
    const isParent = depth === 0;
    const isChild = !isParent;

    // Calculate progress for the progress bar
    const progress = item.isTask
      ? (item.completedUnits / item.numberOfUnits) * 100
      : item.children && item.children.length > 0
      ? calculateChildrenProgress(item.children)
      : 0;

    return (
      <div key={item.id} className="item-wrapper">
        <div
          className={`item-row ${item.selected ? "selected" : ""}`}
          style={{ backgroundColor: bgColor }}
        >
          {/* Numbered circle on the left (only for top-level items) */}
          {isParent && (
            <div className="item-number">
              <div className="number-circle">{items.indexOf(item) + 1}</div>
            </div>
          )}

          {/* Icon and expand/collapse button */}
          <div className="icon-section">
            {depth > 0 && <div className="depth-spacer" style={{ width: `${depth * 24}px` }}></div>}
            <div className="avatar-container">
              <div className="avatar">{item.title ? item.title.charAt(0) : "A"}</div>
            </div>
            {item.children && item.children.length > 0 && (
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
            {/* Progress bar */}
            <div className="progress1-container">
              <div
                className="progress1-bar"
                style={{ width: `${progress}%`, backgroundColor: getProgressColor(progress) }}
              ></div>
              <span className="progress1-text">{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Actions on the right */}
          <div className="actions-section">
            {/* Different actions for parent vs child */}
            {isParent && (
              <>
                <button
                  onClick={(e) => handleDeleteParent(item, e)}
                  className="action-button delete"
                  title="Delete category"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => handleAddButtonClick(item.id)}
                  className="action-button add"
                  title="Add child item"
                >
                  <Plus size={16} />
                </button>
              </>
            )}
            {isChild && (
              <>
                <button
                  onClick={(e) => handleDeleteChild(item, e)}
                  className="action-button delete"
                  title="Remove from category"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
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
      {loading ? (
        <div className="loading">Loading categories and tasks...</div>
      ) : (
        <>
          <div className="items-container">
            {items.length > 0 ? (
              items.map((item) => renderItem(item))
            ) : (
              <div className="no-items-message">No categories found</div>
            )}
          </div>
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
                  <h3 className="modal-title">
                    {addingToParentId
                      ? `Add Child Item ${
                          parentTimeframe ? `(${parentTimeframe})` : "(No timeframe)"
                        }`
                      : "Add New Category"}
                  </h3>
                  <button onClick={() => setShowSearchContainer(false)} className="close-button">
                    <X size={20} />
                  </button>
                </div>
                <div className="search-container">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search tasks..."
                    className="search-input"
                  />
                  <Search size={18} className="search-icon" />
                </div>
                {/* Debug info */}
                <div className="debug-info" style={{ fontSize: "12px", color: "#666" }}>
                  <p>Parent ID: {addingToParentId || "None"}</p>
                  <p>Parent timeframe: {parentTimeframe || "None"}</p>
                </div>
                {parentTimeframe && (
                  <div className="filter-info">
                    <p>
                      Showing tasks with timeframe: <strong>{parentTimeframe}</strong> or lower in
                      hierarchy
                      {parentTimeframe.toLowerCase() === "month" && " (month, week, day)"}
                      {parentTimeframe.toLowerCase() === "week" && " (week, day)"}
                      {parentTimeframe.toLowerCase() === "day" && " (day only)"}
                    </p>
                  </div>
                )}
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
                        <div className="search-item-timeframe">
                          {item.timeframe} - Units: {item.completedUnits}/{item.numberOfUnits}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-results">No tasks found</p>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* Color and Unit Selection Form */}
          {/* Color and Unit Selection Form */}
          {showColorUnitForm && selectedSearchItem && (
            <div className="modal-overlay">
              <div className="modal-container">
                <div className="modal-header">
                  <h3 className="modal-title">
                    {addingToParentId ? "Add Child Item" : "Create Category"}
                  </h3>
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

                {/* Only show color selection for parent items */}
                {addingToParentId === null && (
                  <div className="form-group">
                    <label className="form-label">Select Color</label>
                    <div className="color-grid">
                      {colorOptions.map((color) => (
                        <div
                          key={color.value}
                          onClick={() => setColorSelection(color.value)}
                          className={`color-option ${
                            colorSelection === color.value ? "selected" : ""
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.label}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Only show units selection for child items */}
                {addingToParentId !== null && (
                  <div className="form-group">
                    <label className="form-label">Number of Units</label>
                    <div className="units-info">
                      <p>Total Available: {selectedSearchItem.numberOfUnits || 0}</p>
                      <p>Completed: {selectedSearchItem.completedUnits || 0}</p>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max={selectedSearchItem.numberOfUnits || 10}
                      value={unitSelection}
                      onChange={(e) => setUnitSelection(parseInt(e.target.value) || 1)}
                      className="unit-input"
                    />
                  </div>
                )}

                <div className="modal-actions">
                  <button onClick={() => setShowColorUnitForm(false)} className="cancel-button">
                    Cancel
                  </button>
                  <button onClick={handleColorUnitSubmit} className="submit-button">
                    {addingToParentId ? "Add to Category" : "Create Category"}
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Delete Confirmation Dialog */}
          {showRemoveChildConfirmation && itemToRemove && (
            <div className="modal-overlay">
              <div className="modal-container confirmation-dialog">
                <div className="modal-header">
                  <h3 className="confirmation-title">Remove Task</h3>
                  <button
                    onClick={() => setShowRemoveChildConfirmation(false)}
                    className="close-button"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="confirmation-message">
                  Are you sure you want to remove &quot;{itemToRemove.title}&quot; from this
                  category?
                  <br />
                  <small>
                    The task itself will not be deleted, only removed from this category.
                  </small>
                </div>

                <div className="confirmation-buttons">
                  <button
                    onClick={() => setShowRemoveChildConfirmation(false)}
                    className="confirmation-cancel"
                  >
                    Cancel
                  </button>
                  <button onClick={confirmRemoveChild} className="confirmation-delete">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}{" "}
          {/* Delete Confirmation Dialog */}
          {showDeleteConfirmation && itemToDelete && (
            <div className="modal-overlay">
              <div className="modal-container confirmation-dialog">
                <div className="modal-header">
                  <h3 className="confirmation-title">Delete Category</h3>
                  <button onClick={cancelDelete} className="close-button">
                    <X size={20} />
                  </button>
                </div>

                <div className="confirmation-message">
                  Are you sure you want to delete &quot;{itemToDelete.title}&quot;?
                  {itemToDelete.children && itemToDelete.children.length > 0 && (
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
        </>
      )}
    </div>
  );
};

export default HierarchicalList;
