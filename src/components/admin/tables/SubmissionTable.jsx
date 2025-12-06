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
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Code
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/DropdownMenu';
import { useNavigate } from 'react-router-dom';

const SubmissionTable = ({ 
  submissions, 
  loading, 
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

  if (!submissions || submissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Không có bài nộp nào
      </div>
    );
  }

  const truncateText = (text, maxLength = 50) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Wrong Answer':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'Time Limit Exceeded':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Runtime Error':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'Compilation Error':
        return <Code className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Accepted': 'bg-green-100 text-green-800 border-green-200',
      'Wrong Answer': 'bg-red-100 text-red-800 border-red-200',
      'Time Limit Exceeded': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Runtime Error': 'bg-orange-100 text-orange-800 border-orange-200',
      'Compilation Error': 'bg-purple-100 text-purple-800 border-purple-200'
    };

    return (
      <Badge className={`${variants[status]} flex items-center gap-1 px-2 py-1`}>
        {getStatusIcon(status)}
        <span className="text-xs">{status}</span>
      </Badge>
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${hours}:${minutes}, ${day}/${month}/${year}`;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold">Ngày nộp</TableHead>
            <TableHead className="font-semibold">Username</TableHead>
            <TableHead className="font-semibold">Bài tập</TableHead>
            <TableHead className="font-semibold">Kỳ thi</TableHead>
            <TableHead className="font-semibold">Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow onClick={() => navigate(`/submission/${submission._id}`)} key={submission._id} className="hover:bg-gray-50 cursor-pointer">
              <TableCell className="font-medium">
                {formatDateTime(submission.createdAt) || 'N/A'}
              </TableCell>
              <TableCell className="max-w-xs">
                {truncateText(submission.user?.userName, 60)}
              </TableCell>
              <TableCell className="max-w-xs">
                {truncateText(submission.problem?.name, 60)}
              </TableCell>

              <TableCell className="max-w-xs">
                {submission.contest ? truncateText(submission.contest.code, 60) : ''}
              </TableCell>
              <TableCell className="max-w-xs">
                {getStatusBadge(submission.status)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SubmissionTable;