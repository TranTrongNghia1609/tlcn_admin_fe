import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Trophy, User, MoreVertical, FileText, Edit, Eye, Ban, CheckCircle } from 'lucide-react';
import dayjs from 'dayjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import TablePagination from '@/components/common/TablePagination';
import { getContestParticipants, toggleParticipantStatus } from '@/services/contestService';
import { useParams } from 'react-router-dom';
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/DropdownMenu';
import { toast } from 'sonner';

function ContestParticipants() {
  const {id} = useParams();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchText, setSearchText] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // Mock data - bạn sẽ thay thế bằng API call
  const mockData = {
    status: 200,
    success: true,
    data: {
      content: [
        {
          id: "692b382dc24d2bbc881b10b9",
          user: {
            _id: "68a3d4f02374cdd0d7d352c5",
            userName: "binh123",
            email: "nghia@gmail.com",
            fullName: "Thanh Binh",
            avatar: "https://res.cloudinary.com/da0zhlez4/image/upload/v1756746555/user_avatars/avatar_68a3d4f02374cdd0d7d352c5_1756746552602.jpg"
          },
          contestId: "692b36dbd1bc1f8be4d3e4c4",
          joinedAt: "2025-11-30 01:15:09",
          mode: "official",
          startTime: "2025-11-30 01:10:00",
          endTime: "2025-12-01 01:08:00",
          score: 0,
          problemScores: [],
          lastBestSubmissionScoreAt: "2025-12-21 21:49:45"
        },
        {
          id: "692b3aa7c24d2bbc881b1151",
          user: {
            _id: "690a15018359c466daafec3c",
            userName: "ballball",
            email: "a0qzm59ch5@mail10p.com",
            fullName: "ballball",
            avatar: null
          },
          contestId: "692b36dbd1bc1f8be4d3e4c4",
          joinedAt: "2025-11-30 01:25:43",
          mode: "official",
          startTime: "2025-11-30 01:10:00",
          endTime: "2025-12-01 01:08:00",
          score: 0,
          problemScores: [],
          lastBestSubmissionScoreAt: "2025-12-21 21:49:45"
        },
        {
          id: "692b3bb6c24d2bbc881b11ca",
          user: {
            _id: "68ab4a62bfdd306a660ebca0",
            userName: "nghiadz",
            email: "hetatij565@litepax.com",
            fullName: "Thanh Binh",
            avatar: "https://res.cloudinary.com/da0zhlez4/image/upload/v1757432359/user_avatars/avatar_68ab4a62bfdd306a660ebca0_1757432356545.jpg"
          },
          contestId: "692b36dbd1bc1f8be4d3e4c4",
          joinedAt: "2025-11-30 01:30:14",
          mode: "official",
          startTime: "2025-11-30 01:10:00",
          endTime: "2025-12-01 01:08:00",
          score: 100,
          problemScores: [
            {
              problemId: "692b15dcee990b797c979627",
              bestScore: 100,
              bestSubmissionId: "692b3e4b0141684972d366b3",
              attempts: 5,
              lastSubmittedAt: "2025-11-29T18:41:23.473Z",
              _id: "692b3d2c0141684972d36602"
            }
          ],
          lastBestSubmissionScoreAt: "2025-11-30 01:41:23"
        }
      ],
      page: 1,
      total: 5,
      totalPages: 2,
      last: true
    },
    message: "Success"
  };

  useEffect(() => {
    fetchParticipants();
  }, [pagination.current, searchText]);

  const fetchParticipants = async () => {
    setLoading(true);
    try {

      const data = await getContestParticipants(id, pagination.current);
      console.log('Fetched participants data:', data);
      setParticipants(data.data.content);
        setPagination({
          ...pagination,
          total: data.data.total,
          totalPages: data.data.totalPages
        });
        setLoading(false);
    } catch (error) {
      console.error('Error fetching participants:', error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
    setPagination({ ...pagination, current: 1 });
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, current: newPage });
  }

  const getScoreBadgeVariant = (score) => {
    if (score >= 80) return 'default';
    if (score >= 50) return 'secondary';
    return 'outline';
  };

  const handleToggleStatus = async (userId, userName, currentStatus) => {
    try {
      setUpdatingStatus(userId);

      const action = !currentStatus ? 'huỷ tư cách' : 'kích hoạt';
      const confirmed = window.confirm(
        `Bạn có chắc chắn muốn ${action} dự thi "${userName}"?`
      );

      if (!confirmed) {
        setUpdatingStatus(null);
        return;
      }

      // Gọi API update status
      // await contestService.updateParticipantStatus(id, !currentStatus);
      await toggleParticipantStatus(id, userId);
      // Update local state ngay lập tức
      setParticipants(prevParticipants =>
        prevParticipants.map(participant =>
          participant.user._id === userId
            ? { ...participant, isDisqualified: !currentStatus }
            : participant
        )
      );

      // Hiển thị thông báo thành công
      toast.success(`${!currentStatus ? 'Huỷ tư cách' : 'Kích hoạt'} thi thành công!`);

    } catch (error) {
      console.error('Error toggling participant status:', error);
      toast.error(error.message || 'Không thể cập nhật trạng thái thí sinh');
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              Danh sách thí sinh tham gia
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên, username, email..."
                  value={searchText}
                  onChange={handleSearch}
                  className="pl-8 w-[300px]"
                />
              </div>
              <Button onClick={fetchParticipants} variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                Làm mới
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Thí sinh</TableHead>
                  <TableHead className="w-[200px]">Email</TableHead>
                  <TableHead className="w-[120px] text-center">Trạng thái</TableHead>
                  <TableHead className="w-[100px] text-center">Điểm số</TableHead>
                  <TableHead className="w-[120px] text-center">Số lần nộp</TableHead>
                  <TableHead className="w-[150px]">Thời gian tham gia</TableHead>
                  <TableHead className="w-[150px]">Lần nộp gần nhất</TableHead>
                  <TableHead className="w-[100px] text-center">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-6 w-6 animate-spin mr-2 text-blue-500" />
                        Đang tải...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : participants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  participants.map((record, index) => {
                    const totalAttempts = record.problemScores.reduce((sum, p) => sum + (p.attempts || 0), 0);
                    
                    return (
                      <TableRow 
                        key={record.id}
                        className={record.isDisqualified ? 'bg-red-50 hover:bg-red-100' : ''}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={record.user.avatar} alt={record.user.fullName} />
                                <AvatarFallback>
                                  <User className="h-5 w-5" />
                                </AvatarFallback>
                              </Avatar>
                              {record.isDisqualified && (
                                <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5">
                                  <Ban className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className={`font-medium ${record.isDisqualified ? 'text-red-600' : ''}`}>
                                {record.user.fullName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                @{record.user.userName}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className={record.isDisqualified ? 'text-red-600' : ''}>
                          {record.user.email}
                        </TableCell>
                        <TableCell className="text-center">
                          {record.isDisqualified ? (
                            <Badge variant="destructive" className="flex items-center gap-1 w-fit mx-auto">
                              <Ban className="h-3 w-3" />
                              Đã loại
                            </Badge>
                          ) : (
                            <Badge variant="success" className="flex items-center gap-1 w-fit mx-auto bg-green-100 text-green-800 hover:bg-green-200">
                              <CheckCircle className="h-3 w-3" />
                              Đang thi
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={record.isDisqualified ? 'outline' : getScoreBadgeVariant(record.score)}
                            className={record.isDisqualified ? 'opacity-50' : ''}
                          >
                            <strong>{record.score.toFixed(1)}</strong>
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-center ${record.isDisqualified ? 'text-muted-foreground opacity-50' : ''}`}>
                          {totalAttempts}
                        </TableCell>
                        <TableCell className={record.isDisqualified ? 'text-muted-foreground opacity-50' : ''}>
                          {dayjs(record.joinedAt).format('DD/MM/YYYY HH:mm')}
                        </TableCell>
                        <TableCell className={record.isDisqualified ? 'text-muted-foreground opacity-50' : ''}>
                          {record.lastBestSubmissionScoreAt 
                            ? dayjs(record.lastBestSubmissionScoreAt).format('DD/MM/YYYY HH:mm')
                            : '-'
                          }
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                disabled={updatingStatus === record.id}
                              >
                                {updatingStatus === record.id ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreVertical className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleToggleStatus(record.user._id, record.user.userName, record.isDisqualified)}
                                className={record.isDisqualified ? 'text-green-600' : 'text-red-600'}
                              >
                                {
                                  !record.isDisqualified ? (
                                    <>
                                      <Ban className="mr-2 h-4 w-4" />
                                      Huỷ tư cách
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Kích hoạt
                                    </>
                                  )
                                }
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && participants.length > 0 && (
            <TablePagination
              currentPage={pagination.current}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              maxVisiblePages={10}
          />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ContestParticipants;