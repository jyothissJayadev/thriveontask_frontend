// src/components/EarningsWithChart.jsx
import React, { useEffect, useRef, useMemo } from "react";
import { Box, Paper, Typography, useTheme } from "@mui/material";
import ReactEChart from "./ReactEChart"; // Ensure correct path
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers"; // Import the renderer

// Register ECharts components and charts
import { BarChart, GaugeChart, LineChart } from "echarts/charts";
import { TooltipComponent, TitleComponent, LegendComponent } from "echarts/components";

// Registering everything needed for your chart to work
echarts.use([
  CanvasRenderer,
  BarChart,
  GaugeChart,
  LineChart,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
]);

const EarningsWithChart = () => {
  const theme = useTheme();
  const chartRef = useRef(null);

  const option = useMemo(
    () => ({
      series: [
        {
          type: "gauge",
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          radius: "190%",
          center: ["50%", "100%"],
          splitNumber: 10,
          itemStyle: {
            color: theme.palette.primary.main,
            borderWidth: 0,
          },
          progress: {
            show: true,
            roundCap: false,
            width: 40,
          },
          pointer: {
            icon: "roundRect",
            length: "50%",
            width: 5,
            offsetCenter: [0, -90],
            itemStyle: {
              borderWidth: 20,
            },
          },
          axisLine: {
            roundCap: false,
            lineStyle: {
              width: 40,
              color: [[1, theme.palette.grey[800]]],
            },
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
          title: {
            show: false,
          },
          detail: {
            show: false,
          },
          data: [
            {
              value: 80, // Example value
            },
          ],
        },
      ],
    }),
    [theme]
  );

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        const echartsInstance = chartRef.current.getEchartsInstance();
        echartsInstance.resize({ width: "auto", height: "auto" });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [chartRef]);

  return (
    <Paper sx={{ p: { xs: 4, sm: 8 }, height: 1, backgroundColor: "#141826" }}>
      <Typography variant="h4" color="common.white" mb={2.5}>
        Weekly Speed
      </Typography>

      <Box
        flex={1}
        sx={{
          position: "relative",
        }}
      >
        <ReactEChart
          ref={chartRef}
          option={option}
          echarts={echarts}
          sx={{
            display: "flex",
            justifyContent: "center",
            flex: "1 1 0%",
            maxHeight: 152,
          }}
        />
        <Typography
          variant="h1"
          color="common.white"
          textAlign="center"
          mx="auto"
          position="absolute"
          left={0}
          right={0}
          bottom={0}
        >
          80%
        </Typography>
      </Box>
    </Paper>
  );
};

export default EarningsWithChart;
