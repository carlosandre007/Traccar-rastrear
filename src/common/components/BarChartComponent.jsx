import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
const BarChartComponent = ({ values, columns }) => {
  const data = {
    labels: columns,
    datasets: [
      {
        label: "Veículos",
        data: values,
        backgroundColor: [
          "rgba(0, 128, 0, 0.5)", // Green
          "rgba(255, 165, 0, 0.5)", // Light Orange
          "rgba(255, 140, 0, 0.5)", // Dark Orange
          "rgba(173, 216, 230, 0.5)", // Light Blue
          "rgba(0, 0, 139, 0.5)", // Dark Blue
          "rgba(255, 99, 132, 0.5)", // Light Red
          "rgba(255, 0, 0, 0.5)", // Red
          ],
          borderColor: [
          "rgba(0, 128, 0, 1)", "rgba(255, 165, 0, 1)", "rgba(255, 140, 0, 1)", "rgba(173, 216, 230, 1)", "rgba(0, 0, 139, 1)", "rgba(255, 99, 132, 1)", "rgba(255, 0, 0, 1)", // Green
          // Light Orange
          // Dark Orange
          // Light Blue
          // Dark Blue
          // Light Red
          // Red
          ],
        borderWidth: 1,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Disable the legend
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  return (
    <>
      <Bar options={options} data={data} />;
    </>
  );
};
export default BarChartComponent;
