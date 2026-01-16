import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);
const PieChartComponent = ({values, columns}) => {
  const data = {
    labels: columns,
    datasets: [
      {
        data: values,
        backgroundColor: [
          "rgba(255,99,132,0.6)",
          "rgba(54,162,235,0.6)",
          "rgba(255,206,86,0.6)",
        ],
        borderWidth: 1,
      },
    ],
  };
  return (
    <>
      <Pie data={data} />
    </>
  );
};
export default PieChartComponent;
