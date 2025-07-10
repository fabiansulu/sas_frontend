// src/components/BarChart.jsx
import { Bar } from 'react-chartjs-2';

const BarChart = ({ labels, data, label, color = "#1976d2", height = 300, width = 400 }) => (
  <Bar
    data={{
      labels,
      datasets: [{ label, data, backgroundColor: color }]
    }}
    options={{
      responsive: false,
      plugins: { legend: { display: false } },
      maintainAspectRatio: false,
      width,
      height
    }}
    width={width}
    height={height}
  />
);

export default BarChart;