import React, { useEffect, useState } from 'react';
import { Pie, PieChart, Cell } from 'recharts'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { getAllStatusStatistics } from '@/services/submissionService';
import { Loader2 } from 'lucide-react';

const SubmissionStatusChart = () => {
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const statusColors = {
    "Accepted": "hsl(142, 76%, 36%)",
    "Wrong Answer": "hsl(0, 84%, 60%)",
    "Time Limit Exceeded": "hsl(45, 93%, 47%)",
    "Compilation Error": "hsl(262, 83%, 58%)",
    "Runtime Error": "hsl(24, 95%, 53%)",
    "Internal Error": "hsl(199, 89%, 48%)",
    "Memory Limit Exceeded": "var(--color-mle)"
  };

  const statusLabels = {
    "AC": "Accepted",
    "WA": "Wrong Answer",
    "TLE": "Time Limit Exceeded",
    "CE": "Compilation Error",
    "RE": "Runtime Error",
    "MLE": "Memory Limit Exceeded",
    "Pending": "Pending",
    "IE": "Internal Error"
  };

  useEffect(() => {
    fetchStatusStatistics();
  }, []);

  const fetchStatusStatistics = async () => {
    try {
      setLoading(true);
      const response = await getAllStatusStatistics();
      
      if (response.success) {
        const data = response.data;
        setStats(data);

        // Transform data for chart
        const formattedData = Object.entries(data.statusCounts)
          .filter(([_, count]) => count > 0) // Only include statuses with count > 0
          .map(([status, count]) => ({
            status: statusLabels[status] || status,
            statusCode: status, // ✅ Keep original status code
            count: count,
            fill: statusColors[status] || "hsl(0, 0%, 63%)",
            percentage: data.statusPercentages[status] || 0
          }))
          .sort((a, b) => b.count - a.count); // Sort by count descending

        setChartData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching submission status statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Updated chartConfig with theme colors
  const chartConfig = Object.entries(statusLabels).reduce((acc, [code, label]) => {
    acc[label] = {
      label: label,
      color: statusColors[code]
    };
    return acc;
  }, {});

  if (loading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Thống kê Submissions</CardTitle>
          <CardDescription>Phân bố trạng thái bài nộp</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Thống kê Submissions</CardTitle>
        <CardDescription>Phân bố trạng thái bài nộp</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border rounded-lg shadow-lg">
                      <p className="font-semibold text-sm">{data.status}</p>
                      <p className="text-sm text-gray-600">
                        Count: <span className="font-bold">{data.count.toLocaleString()}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Percentage: <span className="font-bold">{data.percentage}%</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              label={({ percentage }) => `${percentage}`}
              labelLine={false}
              isAnimationActive={true}
              stroke="white"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-3 text-sm pt-4">
        {/* Stats Summary */}
        <div className="w-full grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {stats?.total?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">Tổng submissions</p>
          </div>
          <div className="text-center border-l border-gray-200">
            <p className="text-2xl font-bold text-green-600">
              {stats?.acceptanceRate?.toFixed(2) || 0}%
            </p>
            <p className="text-xs text-gray-600 mt-1">Tỷ lệ AC</p>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full grid grid-cols-2 gap-2">
          {chartData.map((item, index) => (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-xs text-gray-600 truncate">
                {item.status}: <span className="font-semibold">{item.count}</span>
              </span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
};

export default SubmissionStatusChart;