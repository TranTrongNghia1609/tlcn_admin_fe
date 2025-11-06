import React from 'react';
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
  Eye,
  EyeOff,
  Edit
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/DropdownMenu';

const ProblemTable = ({ 
  problems, 
  loading, 
  onToggleStatus, 
  onViewDetail 
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!problems || problems.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Không có bài tập nào
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

  const truncateText = (text, maxLength = 50) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold">Mã bài</TableHead>
            <TableHead className="font-semibold">Tên bài</TableHead>
            <TableHead className="font-semibold">Lượt nộp</TableHead>
            <TableHead className="font-semibold">Thành công</TableHead>
            <TableHead className="font-semibold">Trạng thái</TableHead>
            <TableHead className="font-semibold">Ngày tạo</TableHead>
            <TableHead className="text-center font-semibold">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {problems.map((problem) => (
            <TableRow key={problem._id} className="hover:bg-gray-50">
              <TableCell className="font-medium">
                {problem.shortId || 'N/A'}
              </TableCell>
              <TableCell className="max-w-xs">
                {truncateText(problem.name, 60)}
              </TableCell>
              <TableCell>{problem.numberOfSubmissions || 0}</TableCell>
              <TableCell>{problem.numberOfAccepted || 0}</TableCell>
              <TableCell>
                <Badge 
                  variant={problem.isActive ? 'default' : 'secondary'}
                  className={
                    problem.isActive 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gray-400 hover:bg-gray-500'
                  }
                >
                  {problem.isActive ? 'Hoạt động' : 'Ẩn'}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(problem.createdAt)}</TableCell>
              <TableCell className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetail(problem._id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Xem chi tiết
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleStatus(problem._id, problem.isActive)}>
                      {problem.isActive ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Ẩn bài tập
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Hiển thị
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProblemTable;