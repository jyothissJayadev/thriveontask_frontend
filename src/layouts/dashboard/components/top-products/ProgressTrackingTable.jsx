import React, { useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TablePagination,
  LinearProgress,
  Container,
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { styled } from "@mui/system";

// Styled components for the table and button group
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  margin: "2rem 0",
  borderRadius: "12px",
  color: "white",
  backgroundColor: "#141826",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  "&:hover": {
    boxShadow: "0 6px 24px rgba(0, 0, 0, 0.15)",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#1a2035",
  },
  "&:hover": {
    backgroundColor: "rgb(30, 38, 78)",
    transition: "background-color 0.3s ease",
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  textAlign: "center",
  padding: "16px",
  color: "white",
}));

const ProgressBar = styled(LinearProgress)(({ value }) => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: "#e0e0e0",
  "& .MuiLinearProgress-bar": {
    backgroundColor: value >= 75 ? "#4caf50" : value >= 50 ? "#ff9800" : "#f44336",
  },
}));

const PaginationButton = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  padding: "8px",
  borderRadius: "4px",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  "&.disabled": {
    opacity: 0.5,
    cursor: "not-allowed",
  },
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  marginBottom: "1rem",
  "& .MuiToggleButton-root": {
    padding: "8px 24px",
    borderRadius: "8px",
    color: "white",
    margin: "0 4px",
    "&.Mui-selected": {
      backgroundColor: "#1976d2",
      color: "#fff",
      "&:hover": {
        backgroundColor: "#1565c0",
      },
    },
  },
}));

const generateDummyData = (timeframe) => {
  return Array.from({ length: 50 }, (_, index) => {
    let hoursLeft = Math.floor(Math.random() * 72);
    let daysLeft;

    switch (timeframe) {
      case "day":
        daysLeft = Math.floor(Math.random() * 1) + 0.1;
        break;
      case "week":
        daysLeft = Math.floor(Math.random() * 7) + 1;
        break;
      case "month":
        daysLeft = Math.floor(Math.random() * 30) + 1;
        break;
      default:
        daysLeft = Math.floor(Math.random() * 30) + 1;
    }

    return {
      id: index + 1,
      name: `Project ${index + 1}`,
      percentageCompleted: Math.floor(Math.random() * 100),
      daysLeft,
      hoursLeft: hoursLeft,
    };
  });
};

const formatTimeLeft = (days, hours) => {
  if (days < 1) {
    return {
      text: `${hours} hr`,
      isUrgent: true,
    };
  }
  return {
    text: `${Math.floor(days)} days`,
    isUrgent: days <= 7,
  };
};

const ProgressTrackingTable = () => {
  const [timeframe, setTimeframe] = useState("week");
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const theme = useTheme();

  const handleTimeframeChange = (_, newTimeframe) => {
    if (newTimeframe !== null) {
      setTimeframe(newTimeframe);
      setPage(0);
    }
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const data = generateDummyData(timeframe);
  const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mt: 4 }}>
        Progress Tracking Dashboard
      </Typography>

      {/* Timeframe Toggle Button Group */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3, color: "white" }}>
        <StyledToggleButtonGroup
          value={timeframe}
          exclusive
          onChange={handleTimeframeChange}
          aria-label="timeframe"
          sx={{
            flexDirection: { xs: "column", sm: "row" }, // Stack vertically on small screens
            "& .MuiToggleButton-root": {
              width: { xs: "100%", sm: "auto" }, // Full width on small screens
              marginBottom: { xs: "8px", sm: 0 }, // Margin between buttons when stacked
            },
          }}
        >
          <ToggleButton value="day" aria-label="day view">
            Day
          </ToggleButton>
          <ToggleButton value="week" aria-label="week view">
            Week
          </ToggleButton>
          <ToggleButton value="month" aria-label="month view">
            Month
          </ToggleButton>
        </StyledToggleButtonGroup>
      </Box>

      {/* Table displaying progress */}
      <StyledTableContainer component={Paper}>
        <Table aria-label="progress tracking table">
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Progress</StyledTableCell>
              <StyledTableCell>Time Left</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
              const timeLeft = formatTimeLeft(row.daysLeft, row.hoursLeft);
              return (
                <StyledTableRow key={row.id}>
                  <StyledTableCell>{row.id}</StyledTableCell>
                  <StyledTableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {row.name}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Box sx={{ width: "100%", mb: 1 }}>
                      <ProgressBar
                        variant="determinate"
                        value={row.percentageCompleted}
                        aria-label={`${row.percentageCompleted}% completed`}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {row.percentageCompleted}%
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Typography
                      variant="body1"
                      color={timeLeft.isUrgent ? "error.main" : "text.primary"}
                      fontWeight="medium"
                    >
                      {timeLeft.text}
                    </Typography>
                  </StyledTableCell>
                </StyledTableRow>
              );
            })}
            {emptyRows > 0 && (
              <TableRow style={{ height: 73 * emptyRows }}>
                <TableCell colSpan={4} />
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", p: 2 }}>
          <TablePagination
            component="div"
            count={data.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10]}
          />
        </Box>
      </StyledTableContainer>
    </Container>
  );
};

export default ProgressTrackingTable;
