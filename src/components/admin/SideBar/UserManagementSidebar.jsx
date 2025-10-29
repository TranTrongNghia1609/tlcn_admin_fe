import React from 'react';
import { Card } from '../..//ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity } from 'lucide-react';

const UserManagementSidebar = ({ stats, recentUsers }) => {
  // Calculate user distribution
  const regularUsers = stats.totalUsers - stats.totalTeachers - stats.totalAdmins;
  const totalNonZero = regularUsers + stats.totalTeachers + stats.totalAdmins;
  
  const chartData = totalNonZero > 0 ? [
    { 
      name: 'Người dùng', 
      value: regularUsers, 
      color: '#3B82F6', 
      percentage: ((regularUsers / totalNonZero) * 100).toFixed(0) 
    },
    { 
      name: 'Giáo viên', 
      value: stats.totalTeachers, 
      color: '#10B981', 
      percentage: ((stats.totalTeachers / totalNonZero) * 100).toFixed(0) 
    },
    { 
      name: 'Quản trị viên', 
      value: stats.totalAdmins, 
      color: '#8B5CF6', 
      percentage: ((stats.totalAdmins / totalNonZero) * 100).toFixed(0) 
    },
  ].filter(item => item.value > 0) : [];

  return (
    <div className="space-y-6">
      {/* Role Distribution Chart */}
      <Card className="p-6 border-0 shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Phân bố vai trò</h3>
        
        {chartData.length > 0 ? (
          <>
            {/* Chart */}
            <div className="flex justify-center mb-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `${value} người`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px',
                      padding: '8px 12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.value} người</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold" style={{ color: item.color }}>
                      {item.percentage}%
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Tổng cộng</span>
                <span className="text-lg font-bold text-gray-900">{stats.totalUsers} người</span>
              </div>
            </div>
          </>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">
            <p className="text-sm">Chưa có dữ liệu</p>
          </div>
        )}
      </Card>

      {/* Recent Users */}
      <Card className="p-6 border-0 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Người dùng mới</h3>
          <Activity className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-3">
          {recentUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Chưa có người dùng mới</p>
            </div>
          ) : (
            recentUsers.map((user) => (
              <div 
                key={user._id} 
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex-shrink-0">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.userName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                      {user.userName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.fullName || user.userName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    @{user.userName}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <div className="flex-shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-700'
                      : user.role === 'teacher'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role === 'admin' ? 'Admin' : user.role === 'teacher' ? 'Giáo viên' : 'User'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* View All Link */}
        {recentUsers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">
              Xem tất cả người dùng mới →
            </button>
          </div>
        )}
      </Card>

      {/* Quick Stats */}
      <Card className="p-6 border-0 shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Thống kê nhanh</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Đang hoạt động</span>
            <span className="text-lg font-bold text-green-600">{stats.totalActive}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Bị khóa</span>
            <span className="text-lg font-bold text-red-600">
              {stats.totalUsers - stats.totalActive}
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Tỷ lệ hoạt động</span>
            <span className="text-lg font-bold text-blue-600">
              {stats.totalUsers > 0 
                ? ((stats.totalActive / stats.totalUsers) * 100).toFixed(1) 
                : 0}%
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserManagementSidebar;