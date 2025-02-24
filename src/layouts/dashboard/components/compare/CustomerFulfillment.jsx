import { useMemo, useRef } from "react";
import * as echarts from "echarts";
import { Box, Button, Divider, Paper, Stack, Typography, alpha, useTheme } from "@mui/material";
import ReactEChart from "./ReactEChart"; // Ensure this component is available
import MDBox from "components/MDBox"; // Assuming MDBox is a custom component
const CustomerFulfillment = () => {
  const theme = useTheme();
  const chartRef = useRef(null);

  // Internal data for the chart
  const customerFulfillmentData = {
    "This Month": [355, 390, 300, 350, 390, 180, 250],
    "Last Month": [280, 250, 325, 215, 250, 310, 170],
  };

  const getTotalFulfillment = (chartData) => {
    return chartData.reduce((prev, current) => prev + current, 0);
  };

  const option = useMemo(
    () => ({
      color: [theme.palette.secondary.main, theme.palette.primary.main],
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
        },
      },
      legend: {
        show: false,
        data: ["This Month", "Last Month"],
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
          name: "This Month",
          type: "line",
          stack: "Total",
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
                color: theme.palette.secondary.main,
              },
            ]),
          },
          emphasis: {
            focus: "series",
          },
          data: customerFulfillmentData["This Month"],
        },
        {
          id: 2,
          name: "Last Month",
          type: "line",
          stack: "Total",
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
                color: theme.palette.primary.main,
              },
            ]),
          },
          emphasis: {
            focus: "series",
          },
          data: customerFulfillmentData["Last Month"],
        },
      ],
    }),
    [theme]
  );

  return (
    <MDBox // Stack children vertically
      position="relative"
      minHeight="18.75rem"
      borderRadius="xl"
      padding="50px"
      bgColor="#141826" // Set a background color (change "primary" to any valid color)
      sx={{
        color: "white", // Set text color for contrast
        opacity: 1, // Full opacity
        textAlign: "center", // Align text to the center
      }}
    >
      <Typography variant="h4" color="common.white">
        You Are The Best
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
                  bgcolor: "secondary.main",
                  borderRadius: 400,
                }}
              />
            }
          >
            This Month
          </Button>
          <Typography variant="body2" color="common.white">
            {getTotalFulfillment(customerFulfillmentData["This Month"])}
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
                  bgcolor: "primary.main",
                  borderRadius: 400,
                }}
              />
            }
          >
            Last Month
          </Button>
          <Typography variant="body2" color="common.white">
            {getTotalFulfillment(customerFulfillmentData["Last Month"])}
          </Typography>
        </Stack>
      </Stack>
    </MDBox>
  );
};

export default CustomerFulfillment;
