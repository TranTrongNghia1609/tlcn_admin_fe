import React, { useState, useEffect } from 'react';
import Modal from '../../common/Modal';
import { userService } from '../../../services/userService';
import LoadingSpinner from '../../common/LoadingSpinner';
import { Card } from '../../ui/card';

const UserDetailModal = ({ isOpen, onClose, userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetail();
    }
    
    // Cleanup khi unmount
    return () => {
      setUser(null);
      setError(null);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, userId]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching user detail for:', userId);
      const response = await userService.getAdminUserDetail(userId);
      console.log('User detail response:', response);
      setUser(response.data);
    } catch (err) {
      console.error('Error fetching user detail:', err);
      setError(err.message || 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    // Đảm bảo xóa overflow hidden trước khi gọi onClose
    document.body.style.overflow = 'unset';
    onClose();
  };
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-red-100 text-red-800',
      user: 'bg-blue-100 text-blue-800',
      moderator: 'bg-purple-100 text-purple-800'
    };
    return badges[role] || badges.user;
  };

  const getStatusBadge = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Chi tiết người dùng"
      size="3xl"
      showCloseButton={true}
    >
      <div className="p-6 max-h-[80vh] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-semibold">{error}</p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* Header với Avatar */}
            <div className="flex items-start space-x-6 pb-6 border-b">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.userName || 'User'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold">
                      {user.userName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{user.userName || 'N/A'}</h2>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(user.role)}`}>
                      {user.role?.toUpperCase() || 'USER'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(user.active)}`}>
                      {user.active ? 'Hoạt động' : 'Vô hiệu hóa'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600 mb-3">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {user.email || 'N/A'}
                </div>

                {user.fullName && (
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {user.fullName}
                  </div>
                )}
              </div>
            </div>

            {/* Thông tin cá nhân */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Thông tin cá nhân
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tên đầy đủ</label>
                  <p className="text-gray-900 mt-1">{user.fullName || 'Chưa cập nhật'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900 mt-1">{user.email || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày sinh</label>
                  <p className="text-gray-900 mt-1">
                    {user.dob ? new Date(user.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Giới tính</label>
                  <p className="text-gray-900 mt-1">
                    {user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : user.gender === 'other' ? 'Khác' : 'Chưa cập nhật'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                  <p className="text-gray-900 mt-1">{user.phoneNumber || 'Chưa cập nhật'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
                  <p className="text-gray-900 mt-1">{user.address || 'Chưa cập nhật'}</p>
                </div>
              </div>

              {user.bio && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-500">Giới thiệu</label>
                  <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg">{user.bio}</p>
                </div>
              )}
            </Card>

            {/* Thông tin học tập */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Thông tin học tập
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  {/* <label className="text-sm font-medium text-gray-500">Trường học</label>
                  <p className="text-gray-900 mt-1">{user.school || 'Chưa cập nhật'}</p> */}
                  Chưa thêm vào
                </div>

                <div>
                  {/* <label className="text-sm font-medium text-gray-500">Chuyên ngành</label>
                  <p className="text-gray-900 mt-1">{user.major || 'Chưa cập nhật'}</p> */}
                </div>
              </div>
            </Card>

            {/* Footer Actions */}
            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy thông tin người dùng</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default UserDetailModal;