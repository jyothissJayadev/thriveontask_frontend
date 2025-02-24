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
} from "@mui/material";
import { styled } from "@mui/system";
import { FiMoreVertical, FiEdit2, FiTrash2, FiClock, FiSearch } from "react-icons/fi";
import MDBox from "components/MDBox";
import { getTasks } from "api/api"; // Adjust according to your API setup

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
  const [shiftAnchorEl, setShiftAnchorEl] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedTask, setEditedTask] = useState({});
  const [durationFilter, setDurationFilter] = useState("all");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmActionDialog, setConfirmActionDialog] = useState(false);
  const [actionType, setActionType] = useState(""); // track which action is being confirmed

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await getTasks(token);
        if (response.success) {
          setTasks(response.tasks);
        } else {
          setError(response.error);
        }
      } catch (err) {
        setError("Error fetching tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

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
    setSelectedTask(null);
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
    setEditedTask(selectedTask);
    setIsEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditedTask({});
  };

  const handleDelete = () => {
    // Implement delete logic
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
        <StyledTableContainer component={Paper}>
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
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{task.taskName}</TableCell>
                    <TableCell>{task.numberOfUnits}</TableCell>
                    <TableCell>
                      <Box sx={{ width: "100%" }}>
                        <Tooltip title={`${task.completedUnits}%`} arrow>
                          <CustomLinearProgress variant="determinate" value={task.completedUnits} />
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
        </StyledTableContainer>
      </div>

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

      <Dialog open={confirmActionDialog} onClose={() => setConfirmActionDialog(false)}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to proceed with this action?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleConfirmDialogClose(false)}>No</Button>
          <Button onClick={() => handleConfirmDialogClose(true)} variant="contained">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isEditDialogOpen} onClose={handleEditDialogClose}>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Name"
            fullWidth
            variant="outlined"
            value={editedTask.taskName || ""}
            onChange={(e) => setEditedTask({ ...editedTask, taskName: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Units"
            type="number"
            fullWidth
            variant="outlined"
            value={editedTask.numberOfUnits || ""}
            onChange={(e) =>
              setEditedTask({ ...editedTask, numberOfUnits: parseInt(e.target.value) })
            }
          />
          <TextField
            margin="dense"
            label="Completed Units"
            type="number"
            fullWidth
            variant="outlined"
            value={editedTask.completedUnits || ""}
            onChange={(e) =>
              setEditedTask({
                ...editedTask,
                completedUnits: Math.min(100, parseInt(e.target.value)),
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button onClick={handleEditDialogClose} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
};

export default TaskManagementTable;
