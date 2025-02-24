// src/components/ReactEChart.jsx
import React, { forwardRef } from "react";
import { Box } from "@mui/material";
import EChartsReactCore from "echarts-for-react/lib/core"; // Ensure this import is correct
import PropTypes from "prop-types";

const ReactEChart = forwardRef(({ option, ...rest }, ref) => {
  return (
    <Box
      component={EChartsReactCore}
      ref={ref}
      option={{
        ...option,
        tooltip: {
          ...option.tooltip,
          confine: true,
        },
      }}
      {...rest}
    />
  );
});

ReactEChart.propTypes = {
  option: PropTypes.shape({
    tooltip: PropTypes.object,
    series: PropTypes.array.isRequired,
  }).isRequired,
};

export default ReactEChart;
