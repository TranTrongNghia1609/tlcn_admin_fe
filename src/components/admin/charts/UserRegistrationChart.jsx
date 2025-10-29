import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { formatChartData, getChartConfig } from '../../../utils/chartHelpers';

// Đăng ký các thành phần Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const UserRegistrationChart = ({ data, period, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        Không có dữ liệu để hiển thị
      </div>
    );
  }

  const formattedData = formatChartData(data, period);

  const chartData = {
    labels: formattedData.map(item => item.date),
    datasets: [
      {
        label: 'Số người dùng đăng ký',
        data: formattedData.map(item => item.count),
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4
      }
    ]
  };

  const options = getChartConfig(period);

  return (
    <div className="w-full h-96">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default UserRegistrationChart;