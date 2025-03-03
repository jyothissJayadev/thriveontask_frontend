import { useMemo, useRef } from "react";
import * as echarts from "echarts";
import { Box, Button, Divider, Stack, Typography, alpha, useTheme } from "@mui/material";
import ReactEChart from "./ReactEChart";
import MDBox from "components/MDBox";
import PropTypes from "prop-types";

const CustomerFulfillment = ({ allUsersSpeedData = [] }) => {
  const theme = useTheme();
  const chartRef = useRef(null);
  console.log(allUsersSpeedData);

  // Define special user IDs and their properties
  const specialUsers = {
    "67b2fe03970b1f0a9e9d6630": {
      pronoun: "she",
      color: "#fa5ce8", // Custom color for this user
    },
    "67b2ff45970b1f0a9e9d6633": {
      pronoun: "he",
      color: "#4a45f5", // Custom color for this user
    },
  };

  // Process the data to format it for the chart
  const processedData = useMemo(() => {
    // Default empty data
    const defaultData = {
      "User 1": [100, 0, 0, 0, 0, 0, 0],
      "User 2": [100, 0, 0, 0, 0, 0, 0],
    };

    // If we don't have enough data, return defaults
    if (!allUsersSpeedData || allUsersSpeedData.length < 2) {
      return defaultData;
    }

    // Take the first two users from the data
    const user1 = allUsersSpeedData[0];
    const user2 = allUsersSpeedData[1];

    // Extract the speed values for each day (assuming speeds are sorted by day)
    // Pad arrays to ensure 7 days of data
    const user1Speeds = Array(7).fill(0);
    const user2Speeds = Array(7).fill(0);

    // Fill in available speed data
    if (user1 && user1.speeds) {
      user1.speeds.forEach((speedEntry, index) => {
        if (index < 7) {
          user1Speeds[index] = speedEntry.completeSpeed || 0;
        }
      });
    }

    if (user2 && user2.speeds) {
      user2.speeds.forEach((speedEntry, index) => {
        if (index < 7) {
          user2Speeds[index] = speedEntry.completeSpeed || 0;
        }
      });
    }

    return {
      [user1.userId || "User 1"]: user1Speeds,
      [user2.userId || "User 2"]: user2Speeds,
    };
  }, [allUsersSpeedData]);

  // Calculate totals for display
  const getTotalFulfillment = (chartData) => {
    return chartData.reduce((prev, current) => prev + current, 0);
  };

  // Get user information for display, including pronouns
  const userInfo = useMemo(() => {
    if (!allUsersSpeedData || allUsersSpeedData.length < 2) {
      return [
        { label: "User 1", pronoun: "", color: theme.palette.secondary.main },
        { label: "User 2", pronoun: "", color: theme.palette.primary.main },
      ];
    }

    return [
      {
        label: allUsersSpeedData[0]?.userId
          ? `User ${allUsersSpeedData[0].userId.substring(0, 5)}...`
          : "User 1",
        pronoun: specialUsers[allUsersSpeedData[0]?.userId]?.pronoun || "",
        color: specialUsers[allUsersSpeedData[0]?.userId]?.color || theme.palette.secondary.main,
      },
      {
        label: allUsersSpeedData[1]?.userId
          ? `User ${allUsersSpeedData[1].userId.substring(0, 5)}...`
          : "User 2",
        pronoun: specialUsers[allUsersSpeedData[1]?.userId]?.pronoun || "",
        color: specialUsers[allUsersSpeedData[1]?.userId]?.color || theme.palette.primary.main,
      },
    ];
  }, [allUsersSpeedData, theme]);

  // Update the chart options with the processed data and custom colors
  const option = useMemo(
    () => ({
      color: [userInfo[0].color, userInfo[1].color],
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
        },
      },
      legend: {
        show: false,
        data: userInfo.map((user) => user.label),
      },
      grid: {
        top: 0,
        right: 5,
        bottom: 1,
        left: 5,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        show: true,
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        axisLabel: {
          show: false,
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: alpha(theme.palette.common.white, 0.06),
            width: 1,
          },
        },
      },
      yAxis: [
        {
          type: "value",
          show: false,
        },
      ],
      series: [
        {
          id: 1,
          name: userInfo[0].label,
          type: "line",
          lineStyle: {
            width: 2,
          },
          showSymbol: true,
          symbol: "circle",
          symbolSize: 5,
          areaStyle: {
            opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 0.9, [
              {
                offset: 1,
                color: theme.palette.grey.A100,
              },
              {
                offset: 0,
                color: userInfo[0].color,
              },
            ]),
          },
          emphasis: {
            focus: "series",
          },
          data: Object.values(processedData)[0],
        },
        {
          id: 2,
          name: userInfo[1].label,
          type: "line",
          lineStyle: {
            width: 2,
          },
          showSymbol: true,
          symbol: "circle",
          symbolSize: 5,
          areaStyle: {
            opacity: 0.75,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 0.95, [
              {
                offset: 1,
                color: theme.palette.grey.A100,
              },
              {
                offset: 0,
                color: userInfo[1].color,
              },
            ]),
          },
          emphasis: {
            focus: "series",
          },
          data: Object.values(processedData)[1],
        },
      ],
    }),
    [theme, processedData, userInfo]
  );

  return (
    <MDBox
      position="relative"
      minHeight="18.75rem"
      borderRadius="xl"
      padding="50px"
      bgColor="#141826"
      sx={{
        color: "white",
        opacity: 1,
        textAlign: "center",
      }}
    >
      <Typography variant="h4" color="common.white">
        User Speed Comparison
      </Typography>
      <ReactEChart
        ref={chartRef}
        option={option}
        echarts={echarts}
        sx={{ height: "220px !important", flexGrow: 1 }}
      />
      <Stack
        direction="row"
        justifyContent="space-around"
        divider={
          <Divider
            orientation="vertical"
            flexItem
            sx={{ borderColor: alpha(theme.palette.common.white, 0.06), height: 1 }}
          />
        }
        px={2}
        pt={3}
        sx={{
          transitionProperty: "all",
          transitionDelay: "1s",
        }}
      >
        <Stack gap={1.25} alignItems="center">
          <Button
            variant="text"
            sx={{
              p: 0.5,
              borderRadius: 1,
              fontSize: "body2.fontSize",
              color: "text.disabled",
              "&:hover": {
                bgcolor: "transparent",
              },
              "& .MuiButton-startIcon": {
                mx: 0,
                mr: 1,
              },
            }}
            disableRipple
            startIcon={
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  bgcolor: userInfo[0].color,
                  borderRadius: 400,
                }}
              />
            }
          >
            {userInfo[0].label} {userInfo[0].pronoun && `(${userInfo[0].pronoun})`}
          </Button>
          <Typography variant="body2" color="common.white">
            {getTotalFulfillment(Object.values(processedData)[0])}
          </Typography>
        </Stack>
        <Stack gap={1.25} alignItems="center">
          <Button
            variant="text"
            sx={{
              p: 0.5,
              borderRadius: 1,
              fontSize: "body2.fontSize",
              color: "text.disabled",
              "&:hover": {
                bgcolor: "transparent",
              },
              "& .MuiButton-startIcon": {
                mx: 0,
                mr: 1,
              },
            }}
            disableRipple
            startIcon={
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  bgcolor: userInfo[1].color,
                  borderRadius: 400,
                }}
              />
            }
          >
            {userInfo[1].label} {userInfo[1].pronoun && `(${userInfo[1].pronoun})`}
          </Button>
          <Typography variant="body2" color="common.white">
            {getTotalFulfillment(Object.values(processedData)[1])}
          </Typography>
        </Stack>
      </Stack>
    </MDBox>
  );
};

CustomerFulfillment.propTypes = {
  allUsersSpeedData: PropTypes.array,
};

export default CustomerFulfillment;
