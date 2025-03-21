// src/components/GaugeComponent.js
import React, { useEffect } from "react";
import { RadialGauge } from "canvas-gauges";
import "./Gps.css"; // Import the same CSS file

const GaugeComponent = ({ id, value, unit, min, max }) => {
  useEffect(() => {
    new RadialGauge({
      renderTo: id,
      width: 200,
      height: 200,
      units: unit,
      minValue: min,
      maxValue: max,
      majorTicks: [min, max],
      minorTicks: 5,
      strokeTicks: true,
      highlights: [{ from: min, to: max, color: "rgba(255,0,0,.3)" }],
      value: value,
      animation: { duration: 500 },
    }).draw();
  }, [id, value]);

  return <canvas id={id}></canvas>;
};

export default GaugeComponent;