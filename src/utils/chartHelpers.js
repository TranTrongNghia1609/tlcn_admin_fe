// Hàm format dữ liệu cho chart dựa trên period
export const formatChartData = (data, period) => {
  if (!data || !data.data) return [];

  const chartData = data.data.map(item => ({
    date: formatDateLabel(item.date, period),
    count: item.count,
    rawDate: item.date
  }));

  // Fill missing data points với count = 0
  return fillMissingDataPoints(chartData, data.points, period);
};

// Format label cho trục X dựa trên period
const formatDateLabel = (dateStr, period) => {
  const date = new Date(dateStr);
  
  switch (period) {
    case 'week':
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit' 
      });
      
    case 'month':
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit' 
      });
      
    case 'quarter':
      const weekNum = dateStr.split('-W')[1];
      return `Tuần ${weekNum}`;
      
    case 'year':
      return date.toLocaleDateString('vi-VN', { 
        month: '2-digit', 
        year: 'numeric' 
      });
      
    default:
      return dateStr;
  }
};

// Điền các điểm dữ liệu thiếu
const fillMissingDataPoints = (data, expectedPoints, period) => {
  const filledData = [];
  const now = new Date();
  
  for (let i = expectedPoints - 1; i >= 0; i--) {
    let date;
    
    switch (period) {
      case 'week':
        date = new Date(now);
        date.setDate(date.getDate() - i);
        break;
        
      case 'month':
        date = new Date(now);
        date.setDate(date.getDate() - i);
        break;
        
      case 'quarter':
        date = new Date(now);
        date.setDate(date.getDate() - (i * 7));
        break;
        
      case 'year':
        date = new Date(now);
        date.setMonth(date.getMonth() - i);
        break;
        
      default:
        date = new Date(now);
    }
    
    const formattedDate = formatDateLabel(date.toISOString(), period);
    const existingData = data.find(d => d.date === formattedDate);
    
    filledData.push({
      date: formattedDate,
      count: existingData ? existingData.count : 0
    });
  }
  
  return filledData;
};

// Tính tổng số người dùng từ data
export const calculateTotal = (data) => {
  if (!data || !data.data) return 0;
  return data.data.reduce((sum, item) => sum + item.count, 0);
};

// Config cho chart
export const getChartConfig = (period) => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        callbacks: {
          title: (context) => {
            return `${context[0].label}`;
          },
          label: (context) => {
            return `Số người dùng: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };
};