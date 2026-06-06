import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSkeleton
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MoreVertical,
  Eye,
  EyeOff,
  Trash2,
  MessageSquare
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { commentService } from '@/services/commentService';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const CommentTable = ({ comments: initialComments, loading, onCommentUpdated }) => {
  const [comments, setComments] = useState(initialComments);
  const [updatingId, setUpdatingId] = useState(null);
  const [hideDialogOpen, setHideDialogOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [hideReason, setHideReason] = useState('');

  React.useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleToggleHide = async (comment) => {
    if (!comment.isHidden) {
      setSelectedComment(comment);
      setHideDialogOpen(true);
      return;
    }

    await performToggleHide(comment._id, null);
  };

  const performToggleHide = async (commentId, reason) => {
    try {
      setUpdatingId(commentId);
      
      const response = await commentService.toggleHideComment(commentId, reason);

      if (response.success) {
        setComments(prevComments =>
          prevComments.map(c =>
            c._id === commentId
              ? { ...c, isHidden: !c.isHidden }
              : c
          )
        );

        toast.success(response.message || 'Cập nhật thành công');
        onCommentUpdated?.();
      }
    } catch (error) {
      console.error('Toggle hide comment error:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái bình luận');
    } finally {
      setUpdatingId(null);
      setHideDialogOpen(false);
      setSelectedComment(null);
      setHideReason('');
    }
  };

  const handleDelete = async (commentId) => {
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa bình luận này?');
    if (!confirmed) return;

    try {
      setUpdatingId(commentId);
      
      const response = await commentService.deleteAdminComment(commentId);

      if (response.success) {
        setComments(prevComments =>
          prevComments.filter(c => c._id !== commentId)
        );

        toast.success(response.message || 'Đã xóa bình luận thành công');
        onCommentUpdated?.();
      }
    } catch (error) {
      console.error('Delete comment error:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa bình luận');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getItemModelBadge = (itemModel) => {
    const configs = {
      Post: { label: 'Bài viết', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
      Solution: { label: 'Solution', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
    };
    return configs[itemModel] || { label: itemModel || 'Không rõ', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' };
  };

  if (loading) {
    return (
      <div className="border dark:border-slate-700 rounded-lg overflow-hidden">
        <TableSkeleton rows={10} columns={6} showHeader={true}
          headerLabels={['Người dùng', 'Nội dung', 'Loại', 'Trạng thái', 'Ngày tạo', 'Hành động']} />
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-slate-400">
        Không có bình luận nào
      </div>
    );
  }

  return (
    <>
      <div className="border dark:border-slate-700 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-slate-700/50">
              <TableHead className="font-semibold w-[250px] dark:text-slate-300">Người dùng</TableHead>
              <TableHead className="font-semibold dark:text-slate-300">Nội dung</TableHead>
              <TableHead className="font-semibold w-[120px] dark:text-slate-300">Loại</TableHead>
              <TableHead className="font-semibold w-[100px] dark:text-slate-300">Trạng thái</TableHead>
              <TableHead className="font-semibold w-[150px] dark:text-slate-300">Ngày tạo</TableHead>
              <TableHead className="text-center font-semibold w-[100px] dark:text-slate-300">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comments.map((comment) => {
              const itemModelBadge = getItemModelBadge(comment.itemModel);
              
              return (
                <TableRow key={comment._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/40 dark:border-slate-700">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {comment.authorInfo?.avatar ? (
                          <img
                            src={comment.authorInfo.avatar}
                            alt={comment.authorInfo.userName}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {comment.authorInfo?.userName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">
                          {comment.authorInfo?.fullName || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                          @{comment.authorInfo?.userName || 'unknown'}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="max-w-md">
                      <p className="text-sm text-gray-700 dark:text-slate-300 line-clamp-2">
                        {comment.content}
                      </p>
                      {comment.itemTitle && (
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 truncate" title={comment.itemTitle}>
                          📎 {comment.itemTitle}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {comment.repliesCount || 0} trả lời
                        </span>
                        <span>
                          {comment.likesCount || 0} lượt thích
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge className={itemModelBadge.color}>
                      {itemModelBadge.label}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={comment.isHidden ? 'secondary' : 'default'}
                      className={comment.isHidden ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}
                    >
                      {comment.isHidden ? 'Đã ẩn' : 'Hiển thị'}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm text-gray-600 dark:text-slate-400">
                      {formatDate(comment.createdAt)}
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          disabled={updatingId === comment._id}
                        >
                          {updatingId === comment._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          ) : (
                            <MoreVertical className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleToggleHide(comment)}>
                          {comment.isHidden ? (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Hiện bình luận
                            </>
                          ) : (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Ẩn bình luận
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(comment._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa bình luận
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

      <Dialog open={hideDialogOpen} onOpenChange={setHideDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ẩn bình luận</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do ẩn bình luận này
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="VD: Vi phạm quy định cộng đồng, nội dung không phù hợp..."
              value={hideReason}
              onChange={(e) => setHideReason(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <Button
                className="border-2 cursor-pointer hover:bg-gray-100"
                variant="outline"
                onClick={() => {
                  setHideDialogOpen(false);
                  setSelectedComment(null);
                  setHideReason('');
                }}
              >
                Hủy
              </Button>
              <Button
                className="border-2 cursor-pointer bg-blue-500 hover:bg-blue-600"
                onClick={() => performToggleHide(selectedComment._id, hideReason)}
                disabled={!hideReason.trim()}
              >
                Xác nhận ẩn
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CommentTable;