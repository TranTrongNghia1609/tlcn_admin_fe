// Hàm format dữ liệu cho chart dựa trên period
export const formatChartData = (data, period) => {
  if (!data || !data.data) return [];

  // ✅ Map data với index để xử lý quarter
  const chartData = data.data.map((item, index) => ({
    date: formatDateLabel(item.date, period, index),
    count: item.count,
    rawDate: item.date
  }));

  // Fill missing data points với count = 0
  return fillMissingDataPoints(chartData, data.points, period);
};

// ✅ Format label cho trục X dựa trên period
const formatDateLabel = (dateStr, period, index = 0) => {
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
      // ✅ Fixed: Use index parameter for quarter
      return `Tuần ${index + 1}`;
      
    case 'year':
      return date.toLocaleDateString('vi-VN', { 
        month: '2-digit', 
        year: 'numeric' 
      });
      
    default:
      return dateStr;
  }
};

// ✅ Điền các điểm dữ liệu thiếu
const fillMissingDataPoints = (data, expectedPoints, period) => {
  const filledData = [];
  const now = new Date();
  
  for (let i = expectedPoints - 1; i >= 0; i--) {
    let date;
    let formattedDate;
    
    switch (period) {
      case 'week':
        date = new Date(now);
        date.setDate(date.getDate() - i);
        formattedDate = formatDateLabel(date.toISOString(), period, i);
        break;
        
      case 'month':
        date = new Date(now);
        date.setDate(date.getDate() - i);
        formattedDate = formatDateLabel(date.toISOString(), period, i);
        break;
        
      case 'quarter':
        // ✅ For quarter, calculate week index
        const weekIndex = expectedPoints - 1 - i;
        formattedDate = `Tuần ${weekIndex + 1}`;
        break;
        
      case 'year':
        date = new Date(now);
        date.setMonth(date.getMonth() - i);
        formattedDate = formatDateLabel(date.toISOString(), period, i);
        break;
        
      default:
        date = new Date(now);
        formattedDate = formatDateLabel(date.toISOString(), period, i);
    }
    
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
          maxRotation: period === 'year' ? 0 : 45,
          minRotation: period === 'year' ? 0 : 45,
          autoSkip: period === 'quarter' ? false : true, // ✅ Show all weeks for quarter
          maxTicksLimit: period === 'quarter' ? undefined : 20
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          stepSize: 1 // ✅ Integer steps only
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };
};