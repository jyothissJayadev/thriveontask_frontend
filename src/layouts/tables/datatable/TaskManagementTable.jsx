import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
  Typography,
  Tooltip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  TablePagination,
  InputAdornment,
  Snackbar,
  Alert,
} from "@mui/material";
import { styled } from "@mui/system";
import { FiMoreVertical, FiSearch } from "react-icons/fi";
import MDBox from "components/MDBox";
import { getTasks, updateTask, deleteTask } from "../../../api/api"; // Adjust according to your API setup

// Styles
import "./TaskManagementTable.css"; // Import the separate CSS file

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  margin: "20px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  borderRadius: "10px",
  overflow: "hidden",
  "& .MuiTableRow-root:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    transition: "background-color 0.3s ease",
  },
}));

const CustomLinearProgress = styled(LinearProgress)(({ value }) => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: "#e0e0e0",
  "& .MuiLinearProgress-bar": {
    backgroundColor: value <= 30 ? "#f44336" : value <= 60 ? "#ffb74d" : "#4caf50",
  },
}));

const TaskManagementTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedTask, setEditedTask] = useState({});
  const [durationFilter, setDurationFilter] = useState("all");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmActionDialog, setConfirmActionDialog] = useState(false);
  const [actionType, setActionType] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("jwtToken");
      const response = await getTasks(token);
      if (response.success) {
        setTasks(response.tasks);
      } else {
        setError(response.error);
        showSnackbar(response.error, "error");
      }
    } catch (err) {
      setError("Error fetching tasks");
      showSnackbar("Error fetching tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const filteredData = (tasks || []).filter((task) => {
    const searchFields = [
      task.taskName.toLowerCase(),
      task.numberOfUnits.toString(),
      task.completedUnits.toString(),
      task.timeframe.toLowerCase(),
    ];
    const matchesSearch = searchFields.some((field) => field.includes(searchQuery.toLowerCase()));
    const matchesDuration = durationFilter === "all" || task.timeframe === durationFilter;
    return matchesSearch && matchesDuration;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleMenuOpen = (event, task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleConfirmDialogOpen = (action) => {
    setActionType(action);
    setConfirmActionDialog(true);
    handleMenuClose();
  };

  const handleConfirmDialogClose = (confirm) => {
    if (confirm) {
      if (actionType === "edit") {
        handleEdit();
      } else if (actionType === "delete") {
        handleDelete();
      }
    }
    setConfirmActionDialog(false);
  };

  const handleEdit = () => {
    setEditedTask({ ...selectedTask });
    setIsEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await updateTask(token, editedTask._id, editedTask);

      if (response.success) {
        // Update the tasks list with the edited task
        setTasks(tasks.map((task) => (task._id === editedTask._id ? editedTask : task)));
        showSnackbar("Task updated successfully");
      } else {
        showSnackbar(response.error || "Failed to update task", "error");
      }
    } catch (err) {
      showSnackbar("Error updating task", "error");
    } finally {
      setIsEditDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await deleteTask(token, selectedTask._id);

      if (response.success) {
        // Remove the deleted task from the tasks list
        setTasks(tasks.filter((task) => task._id !== selectedTask._id));
        showSnackbar("Task deleted successfully");
      } else {
        showSnackbar(response.error || "Failed to delete task", "error");
      }
    } catch (err) {
      showSnackbar("Error deleting task", "error");
    }
  };

  const handleEditChange = (field, value) => {
    setEditedTask({
      ...editedTask,
      [field]: value,
    });
  };

  return (
    <MDBox
      position="relative"
      minHeight="18.75rem"
      borderRadius="xl"
      padding="50px"
      bgColor="#141826"
      sx={{ color: "white", opacity: 1, textAlign: "center" }}
    >
      <Box sx={{ p: 2, display: "flex", gap: 2 }}>
        <TextField
          sx={{ flex: 1 }}
          variant="outlined"
          placeholder="Search in all columns..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FiSearch />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          size="small"
          value={durationFilter}
          onChange={(e) => setDurationFilter(e.target.value)}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="all">All Durations</MenuItem>
          <MenuItem value="day">Day</MenuItem>
          <MenuItem value="week">Week</MenuItem>
          <MenuItem value="month">Month</MenuItem>
          <MenuItem value="none">None</MenuItem>
        </TextField>
      </Box>

      <div className="table-container">
        <StyledTableContainer component={Paper} sx={{ width: "100%", overflow: "auto" }}>
          {loading ? (
            <LinearProgress />
          ) : (
            <>
              <Table aria-label="task management table" size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>S.No</TableCell>
                    <TableCell>Task Name</TableCell>
                    <TableCell>Units</TableCell>
                    <TableCell>Completed</TableCell>
                    <TableCell>Timeframe</TableCell>
                    <TableCell>End Time</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((task, index) => (
                      <TableRow key={task._id}>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{task.taskName}</TableCell>
                        <TableCell>{task.numberOfUnits}</TableCell>
                        <TableCell>
                          <Box sx={{ width: "100%" }}>
                            <Tooltip title={`${task.completedUnits}%`} arrow>
                              <CustomLinearProgress
                                variant="determinate"
                                value={task.completedUnits}
                              />
                            </Tooltip>
                            <Typography variant="body2" color="text.secondary">
                              {task.completedUnits}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{task.timeframe}</TableCell>
                        <TableCell>{task.endDate}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            aria-label="more"
                            onClick={(e) => handleMenuOpen(e, task)}
                          >
                            <FiMoreVertical />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={filteredData.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10]}
              />
            </>
          )}
        </StyledTableContainer>
      </div>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={() => handleConfirmDialogOpen("edit")}>Edit</MenuItem>
        <MenuItem onClick={() => handleConfirmDialogOpen("delete")}>Delete</MenuItem>
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog open={confirmActionDialog} onClose={() => handleConfirmDialogClose(false)}>
        <DialogTitle>{actionType === "delete" ? "Confirm Delete" : "Confirm Edit"}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {actionType === "delete"
              ? `Are you sure you want to delete task "${selectedTask?.taskName}"?`
              : `Are you sure you want to edit task "${selectedTask?.taskName}"?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleConfirmDialogClose(false)}>Cancel</Button>
          <Button
            onClick={() => handleConfirmDialogClose(true)}
            variant="contained"
            color={actionType === "delete" ? "error" : "primary"}
          >
            {actionType === "delete" ? "Delete" : "Edit"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onClose={handleEditDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Name"
            fullWidth
            variant="outlined"
            value={editedTask.taskName || ""}
            onChange={(e) => handleEditChange("taskName", e.target.value)}
          />
          <TextField
            margin="dense"
            label="Units"
            type="number"
            fullWidth
            variant="outlined"
            value={editedTask.numberOfUnits || ""}
            onChange={(e) => handleEditChange("numberOfUnits", parseInt(e.target.value, 10) || 0)}
          />
          <TextField
            margin="dense"
            label="Completed Units (%)"
            type="number"
            fullWidth
            variant="outlined"
            value={editedTask.completedUnits || ""}
            onChange={(e) =>
              handleEditChange("completedUnits", Math.min(100, parseInt(e.target.value, 10) || 0))
            }
            inputProps={{ min: 0, max: 100 }}
          />
          <TextField
            select
            margin="dense"
            label="Timeframe"
            fullWidth
            variant="outlined"
            value={editedTask.timeframe || ""}
            onChange={(e) => handleEditChange("timeframe", e.target.value)}
          >
            <MenuItem value="day">Day</MenuItem>
            <MenuItem value="week">Week</MenuItem>
            <MenuItem value="month">Month</MenuItem>
            <MenuItem value="none">None</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            label="End Date"
            type="date"
            fullWidth
            variant="outlined"
            value={editedTask.endDate ? editedTask.endDate.split("T")[0] : ""}
            onChange={(e) => handleEditChange("endDate", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MDBox>
  );
};

export default TaskManagementTable;
