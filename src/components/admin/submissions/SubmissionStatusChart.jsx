import React, { useEffect, useState } from 'react';
import { Pie, PieChart, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { getAllStatusStatistics } from '@/services/submissionService';
import { Loader2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

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

const SubmissionStatusChart = () => {
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchStatusStatistics = async () => {
      try {
        setLoading(true);
        const response = await getAllStatusStatistics();

        if (response.success) {
          const data = response.data;
          setStats(data);

          // Transform data for chart
          const formattedData = Object.entries(data.statusCounts)
            .filter(([, count]) => count > 0) // Only include statuses with count > 0
            .map(([status, count]) => ({
              status: statusLabels[status] || status,
              statusCode: status, //   Keep original status code
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

    fetchStatusStatistics();
  }, []);

  //   Updated chartConfig with theme colors
  const chartConfig = Object.entries(statusLabels).reduce((acc, [code, label]) => {
    acc[label] = {
      label: label,
      color: statusColors[code]
    };
    return acc;
  }, {});

  if (loading) {
    return (
      <Card className="flex flex-col dark:bg-slate-800 dark:border-slate-700">
        <CardHeader className="items-center pb-0">
          <CardTitle className="dark:text-white">Thống kê Submissions</CardTitle>
          <CardDescription className="dark:text-slate-400">Phân bố trạng thái bài nộp</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col dark:bg-slate-800 dark:border-slate-700">
      <CardHeader className="items-center pb-0">
        <CardTitle className="dark:text-white">Thống kê Submissions</CardTitle>
        <CardDescription className="dark:text-slate-400">Phân bố trạng thái bài nộp</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[600px]"
        >
          <PieChart>
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-slate-800 p-3 border dark:border-slate-700 rounded-lg shadow-lg">
                      <p className="font-semibold text-sm dark:text-white">{data.status}</p>
                      <p className="text-sm text-gray-600 dark:text-slate-300">
                        Count: <span className="font-bold dark:text-white">{data.count.toLocaleString()}</span>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-slate-300">
                        Percentage: <span className="font-bold dark:text-white">{data.percentage}%</span>
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
              cx="50%"
              cy="50%"
              outerRadius="70%"
              label={({ percentage }) => `${percentage}%`}
              labelLine={(props) => {
                const { points, fill } = props;
                if (!points || points.length < 2) return null;
                return (
                  <line
                    x1={points[0].x}
                    y1={points[0].y}
                    x2={points[points.length - 1].x}
                    y2={points[points.length - 1].y}
                    stroke={fill}
                    strokeWidth={1.5}
                    strokeOpacity={0.8}
                  />
                );
              }}
              isAnimationActive={true}
              stroke={isDark ? "#1e293b" : "white"}
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
        <div className="w-full grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-slate-700/40 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.total?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">Tổng submissions</p>
          </div>
          <div className="text-center border-l border-gray-200 dark:border-slate-700">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats?.acceptanceRate?.toFixed(2) || 0}%
            </p>
            <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">Tỷ lệ AC</p>
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
              <span className="text-xs text-gray-600 dark:text-slate-300 truncate">
                {item.status}: <span className="font-semibold dark:text-white">{item.count}</span>
              </span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
};

export default SubmissionStatusChart;