import React from 'react';
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
  Trash2, 
  Eye,
  EyeOff,
  Edit,
  UserRound
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/DropdownMenu';
import { useNavigate } from 'react-router-dom';

const ContestTable = ({ 
  contests, 
  loading, 
  onToggleStatus, 
  onViewDetail 
}) => {
  const navigate = useNavigate();
  if (loading) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <TableSkeleton
          rows={10}
          columns={8}
          showHeader={true}
          headerLabels={['Mã cuộc thi', 'Tên cuộc thi', 'Thời gian bắt đầu', 'Thời gian kết thúc', 'Loại', 'Trạng thái', 'Tình trạng', 'Hành động']}
        />
      </div>
    );
  }

  if (!contests || contests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Không có cuộc thi nào
      </div>
    );
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getContestStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) return { label: 'Sắp diễn ra', color: 'bg-blue-600 hover:bg-blue-700' };
    if (now > end) return { label: 'Đã kết thúc', color: 'bg-gray-400 hover:bg-gray-500' };
    return { label: 'Đang diễn ra', color: 'bg-green-600 hover:bg-green-700' };
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold">Mã cuộc thi</TableHead>
            <TableHead className="font-semibold">Tên cuộc thi</TableHead>
            <TableHead className="font-semibold">Thời gian bắt đầu</TableHead>
            <TableHead className="font-semibold">Thời gian kết thúc</TableHead>
            <TableHead className="font-semibold">Loại</TableHead>
            <TableHead className="font-semibold">Trạng thái</TableHead>
            <TableHead className="font-semibold">Tình trạng</TableHead>
            <TableHead className="text-center font-semibold">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contests.map((contest) => {
            const contestStatus = getContestStatus(contest.startTime, contest.endTime);
            
            return (
              <TableRow key={contest._id} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  {contest.code || 'N/A'}
                </TableCell>
                <TableCell className="max-w-xs">
                  {truncateText(contest.title, 60)}
                </TableCell>
                <TableCell>{formatDateTime(contest.startTime)}</TableCell>
                <TableCell>{formatDateTime(contest.endTime)}</TableCell>
                <TableCell>
                  <Badge 
                    variant={contest.isPrivate ? 'secondary' : 'default'}
                    className={
                      contest.isPrivate 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : 'bg-cyan-600 hover:bg-cyan-700'
                    }
                  >
                    {contest.isPrivate ? 'Riêng tư' : 'Công khai'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="default"
                    className={contestStatus.color}
                  >
                    {contestStatus.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={contest.isActive ? 'default' : 'secondary'}
                    className={
                      contest.isActive 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-gray-400 hover:bg-gray-500'
                    }
                  >
                    {contest.isActive ? 'Hoạt động' : 'Ẩn'}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetail(contest._id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleStatus(contest._id, contest.isActive)}>
                        {contest.isActive ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Ẩn cuộc thi
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Hiển thị
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/contest/${contest._id}/participants`) }>
                        <UserRound className="mr-2 h-4 w-4" />
                        Xem thí sinh
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

export default ContestTable;