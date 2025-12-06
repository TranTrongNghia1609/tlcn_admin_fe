import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  Eye,
  EyeOff,
  Edit,
  FileText,
  CheckCircle,
  XCircle
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
  const navigate = useNavigate();

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

  const handleSolutionClick = (problemId) => {
    // Use problem._id instead of shortId
    navigate(`/problems/${problemId}/solution`);
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
            <TableHead className="font-semibold">Giải pháp</TableHead>
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
              
              {/* Solution Status Column */}
              <TableCell>
                {problem.hasSolution ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Có
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200">
                    <XCircle className="w-3 h-3 mr-1" />
                    Chưa có
                  </Badge>
                )}
              </TableCell>

              <TableCell>
                <Badge 
                  variant={problem.isActive ? 'default' : 'secondary'}
                  className={
                    problem.isActive 
                      ? 'bg-blue-600 hover:bg-blue-700' 
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
                    
                    {/* Solution Action - Navigate to solution page using problem._id */}
                    <DropdownMenuItem 
                      onClick={() => handleSolutionClick(problem._id)}
                      className={problem.hasSolution ? "text-orange-600" : "text-blue-600"}
                    >
                      {problem.hasSolution ? (
                        <>
                          <Edit className="mr-2 h-4 w-4" />
                          Cập nhật giải pháp
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Tạo giải pháp
                        </>
                      )}
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