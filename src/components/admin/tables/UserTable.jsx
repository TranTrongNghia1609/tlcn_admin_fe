import React, {useState} from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { 
  MoreVertical, 
  Trash2, 
  Ban, 
  CheckCircle, 
  Eye 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/DropdownMenu';
import UserDetailModal from '../users/UserDetailModal';
import { userService } from '../../../services/userService';
import { toast } from 'sonner'; 

const UserTable = ({ 
  users: initialUsers, 
  loading, 
  onDeleteUser
}) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [users, setUsers] = useState(initialUsers); // Local state

  // Sync với prop users khi thay đổi
  React.useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const handleViewDetail = (userName) => {
    setSelectedUserId(userName);
    setIsDetailModalOpen(true);
  };

  const handleToggleStatus = async (userName, currentStatus) => {
    try {
      setUpdatingStatus(userName);
      
      const action = currentStatus ? 'khóa' : 'kích hoạt';
      const confirmed = window.confirm(
        `Bạn có chắc chắn muốn ${action} tài khoản "${userName}"?`
      );
      
      if (!confirmed) {
        setUpdatingStatus(null);
        return;
      }

      // Gọi API update status
      await userService.updateUserStatus(userName, !currentStatus);
      
      // Update local state ngay lập tức
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.userName === userName 
            ? { ...user, active: !currentStatus }
            : user
        )
      );

      // Hiển thị thông báo thành công
      toast.success(`${currentStatus ? 'Khóa' : 'Kích hoạt'} tài khoản thành công!`);

    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error(error.message || 'Không thể cập nhật trạng thái người dùng');
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Không có người dùng nào
      </div>
    );
  }
  const getRoleDisplay = (role) => {
    const roleMap = {
      user: { label: 'Người dùng', color: 'bg-blue-100 text-blue-800' },
      teacher: { label: 'Giáo viên', color: 'bg-green-100 text-green-800' },
      admin: { label: 'Quản trị viên', color: 'bg-purple-100 text-purple-800' }
    };
    return roleMap[role] || roleMap.user;
  };


  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold w-[300px]">Người dùng</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="font-semibold">Ngày tạo</TableHead>
              <TableHead className="text-center font-semibold w-[100px]">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {              
              return (
                <TableRow key={user._id} className="hover:bg-gray-50">
                  {/* User Info with Avatar */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.userName}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold ${user.avatar ? 'hidden' : 'flex'}`}
                        >
                          {user.userName?.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user.fullName || 'N/A'}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 truncate">@{user.userName}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell>
                    <span className="text-sm text-gray-700">{user.email || 'N/A'}</span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge 
                      variant={user.active ? 'default' : 'secondary'}
                      className={user.active ? 'bg-green-600' : 'bg-gray-400'}
                    >
                      {user.active ? 'Hoạt động' : 'Bị khóa'}
                    </Badge>
                  </TableCell>

                  {/* Created Date */}
                  <TableCell>
                    <span className="text-sm text-gray-600">{formatDate(user.createdAt)}</span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          disabled={updatingStatus === user.userName}
                        >
                          {updatingStatus === user.userName ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          ) : (
                            <MoreVertical className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetail(user.userName)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleToggleStatus(user.userName, user.active)}
                          disabled={updatingStatus === user.userName}
                        >
                          {user.active ? (
                            <>
                              <Ban className="mr-2 h-4 w-4" />
                              Khóa tài khoản
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Kích hoạt
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId}
      />
    </>
  );
};

export default UserTable;