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

const PostTable = ({ 
  posts, 
  loading, 
  onDeletePost, 
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

  if (!posts || posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Không có bài viết nào
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
            <TableHead className="font-semibold">Tiêu đề</TableHead>
            <TableHead className="font-semibold">Tác giả</TableHead>
            <TableHead className="font-semibold">Lượt xem</TableHead>
            <TableHead className="font-semibold">Lượt thích</TableHead>
            <TableHead className="font-semibold">Bình luận</TableHead>
            <TableHead className="font-semibold">Trạng thái</TableHead>
            <TableHead className="font-semibold">Ngày tạo</TableHead>
            <TableHead className="text-center font-semibold">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post._id} className="hover:bg-gray-50">
              <TableCell className="font-medium max-w-xs">
                {truncateText(post.title, 60)}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <span>{post.author?.userName || 'N/A'}</span>
                </div>
              </TableCell>
              <TableCell>{post.viewsCount || 0}</TableCell>
              <TableCell>{post.likesCount || 0}</TableCell>
              <TableCell>{post.commentsCount || 0}</TableCell>
              <TableCell>
                <Badge 
                  variant={post.isPublished ? 'default' : 'secondary'}
                  className={
                    post.isPublished 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gray-400 hover:bg-gray-500'
                  }
                >
                  {post.isPublished ? 'Công khai' : 'Nháp'}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(post.createdAt)}</TableCell>
              <TableCell className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetail(post._id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Xem chi tiết
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleStatus(post._id, post.isPublished)}>
                      {post.isPublished ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Chuyển sang nháp
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Xuất bản
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDeletePost(post._id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa bài viết
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

export default PostTable;