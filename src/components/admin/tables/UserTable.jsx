import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSkeleton
} from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import {
  MoreVertical,
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
import { userService } from '../../../services/userService';
import { toast } from 'sonner';

const UserTable = ({
  users: initialUsers,
  loading,
  onDeleteUser
}) => {
  const navigate = useNavigate();
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [users, setUsers] = useState(initialUsers);

  React.useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const handleViewDetail = (userName) => {
    navigate(`/profile/${userName}`);
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

      await userService.updateUserStatus(userName, !currentStatus);

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.userName === userName
            ? { ...user, active: !currentStatus }
            : user
        )
      );

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
      <div className="border dark:border-slate-700 rounded-lg overflow-hidden">
        <TableSkeleton
          rows={10}
          columns={5}
          showHeader={true}
          headerLabels={['Người dùng', 'Email', 'Trạng thái', 'Ngày tạo', 'Hành động']}
        />
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-slate-400">
        Không có người dùng nào
      </div>
    );
  }

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
    <div className="border dark:border-slate-700 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-slate-700/50">
            <TableHead className="font-semibold w-[300px] dark:text-slate-300">Người dùng</TableHead>
            <TableHead className="font-semibold dark:text-slate-300">Email</TableHead>
            <TableHead className="font-semibold dark:text-slate-300">Trạng thái</TableHead>
            <TableHead className="font-semibold dark:text-slate-300">Ngày tạo</TableHead>
            <TableHead className="text-center font-semibold w-[100px] dark:text-slate-300">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            return (
              <TableRow key={user._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/40 dark:border-slate-700">
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
                        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">
                          {user.fullName || 'N/A'}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 truncate">@{user.userName}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="text-sm text-gray-700 dark:text-slate-300">{user.email || 'N/A'}</span>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={user.active ? 'default' : 'secondary'}
                    className={user.active ? 'bg-green-600' : 'bg-gray-400'}
                  >
                    {user.active ? 'Hoạt động' : 'Bị khóa'}
                  </Badge>
                </TableCell>

                <TableCell>
                  <span className="text-sm text-gray-600 dark:text-slate-400">{formatDate(user.createdAt)}</span>
                </TableCell>

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
  );
};

export default UserTable;