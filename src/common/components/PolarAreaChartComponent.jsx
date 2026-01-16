import React from "react";
import { PolarArea } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
// Register the necessary components for Chart.js
ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);
const PolarAreaChartComponent = ({values, columns}) => {
  const data = {
    labels: columns,
    datasets: [
      {
        label: "Veículos",
        data: values,
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(255, 205, 86, 0.5)",
          "rgba(201, 203, 207, 0.5)",
          "rgba(54, 162, 235, 0.5)",
        ],
        borderWidth: 1,
      },
    ],
  };
  const options = {
    responsive: true,
    scales: {
      r: {
        angleLines: {
          display: false,
        },
        suggestedMin: 0,
        suggestedMax: 10,
      },
    },
  };
  return (
    <>
      <PolarArea data={data} options={options} />
    </>
  );
};
export default PolarAreaChartComponent;
