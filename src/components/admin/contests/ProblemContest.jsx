import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getAllProblemsByAdmin } from '@/services/problemService';

const ProblemContest = ({ contestId, initialProblems = [], onProblemUpdated }) => {  const [searchTerm, setSearchTerm] = useState('');
  const [availableProblems, setAvailableProblems] = useState([]);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    if (initialProblems && initialProblems.length > 0) {
      setSelectedProblems(initialProblems);
    }
  }, [initialProblems]);

  // Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce(async (term) => {
        setLoading(true);
        try {
          // TODO: Thay thế bằng API call thực tế
          const param = {name: term, page: 1, limit: 20}
          const response = await getAllProblemsByAdmin(param);
          setAvailableProblems(response.data.content);
        } catch (error) {
          toast.error('Không thể tìm kiếm bài tập');
        } finally {
          setLoading(false);
        }
      }, 500),
    []
  );

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    } else {
      setAvailableProblems([]);
    }
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  // Load existing problems if editing contest
  useEffect(() => {
    if (contestId) {
      loadContestProblems();
    }
  }, [contestId]);

  const loadContestProblems = async () => {
    try {
      // TODO: Fetch problems for this contest
      // const response = await getContestProblems(contestId);
      // setSelectedProblems(response.data);
    } catch (error) {
      toast.error('Không thể tải danh sách bài tập');
    }
  };

  const handleAddProblem = (problem) => {
    if (selectedProblems.some(p => p._id === problem._id)) {
      toast.warning('Bài tập đã được thêm vào danh sách');
      return;
    }

    const newProblem = {
      ...problem,
      order: selectedProblems.length + 1,
      point: 100 // Default point
    };

    setSelectedProblems([...selectedProblems, newProblem]);
    onProblemUpdated?.([...selectedProblems, newProblem]);
    toast.success('Đã thêm bài tập vào kỳ thi');
    setIsDialogOpen(false);
    setSearchTerm('');
  };

  const handleRemoveProblem = (problemId) => {
    const updated = selectedProblems
      .filter(p => p._id !== problemId)
      .map((p, index) => ({ ...p, order: index + 1 }));
    
    setSelectedProblems(updated);
    onProblemUpdated?.(updated);
    toast.success('Đã xóa bài tập khỏi kỳ thi');
  };

  const handlepointChange = (problemId, point) => {
    const updated = selectedProblems.map(p =>
      p._id === problemId ? { ...p, point: parseInt(point) || 0 } : p
    );
    setSelectedProblems(updated);
    onProblemUpdated?.(updated);
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const items = [...selectedProblems];
    const draggedItemContent = items[draggedItem];
    items.splice(draggedItem, 1);
    items.splice(index, 0, draggedItemContent);

    setDraggedItem(index);
    const updated = items.map((item, idx) => ({ ...item, order: idx + 1 }));
    setSelectedProblems(updated);
    onProblemUpdated?.(updated);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  return (
    <div className="space-y-4">
      {/* Add Problem Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500">
            <Plus className="h-4 w-4 mr-2" />
            Thêm bài tập
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tìm kiếm bài tập</DialogTitle>
            <DialogDescription>
              Tìm kiếm và thêm bài tập vào kỳ thi
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm theo tên, hoặc ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Đang tìm kiếm...
              </div>
            ) : availableProblems.length > 0 ? (
              <div className="space-y-2">
                {availableProblems.map((problem) => (
                  <div
                    key={problem._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{problem.name}</h4>
                        <Badge className={getDifficultyColor(problem.difficulty)}>
                          {problem.difficulty}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {problem.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      className={'bg-gradient-to-r from-blue-600 to-blue-500 cursor-pointer'}
                      onClick={() => handleAddProblem(problem)}
                      size="sm"
                      disabled={selectedProblems.some(p => p._id === problem._id)}
                    >
                      {selectedProblems.some(p => p._id === problem._id) ? 'Đã thêm' : 'Thêm'}
                    </Button>
                  </div>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="text-center py-8 text-gray-500">
                Không tìm thấy bài tập nào
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nhập từ khóa để tìm kiếm bài tập
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Selected Problems Table */}
      {selectedProblems.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead className="w-16">STT</TableHead>
                <TableHead>Tên bài tập</TableHead>
                <TableHead>Độ khó</TableHead>
                <TableHead className="w-32">Điểm</TableHead>
                <TableHead className="w-24">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedProblems.map((problem, index) => (
                <TableRow
                  key={problem._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`cursor-move ${draggedItem === index ? 'opacity-50' : ''}`}
                >
                  <TableCell>
                    <GripVertical className="h-5 w-5 text-gray-400" />
                  </TableCell>
                  <TableCell>{problem.order}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{problem.name}</div>
                      <div className="flex gap-1 mt-1">
                        {problem.tags?.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getDifficultyColor(problem.difficulty)}>
                      {problem.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={problem.point}
                      onChange={(e) => handlepointChange(problem._id, e.target.value)}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveProblem(problem._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-gray-500">Chưa có bài tập nào được thêm vào kỳ thi</p>
          <p className="text-sm text-gray-400 mt-1">
            Nhấn nút "Thêm bài tập" để bắt đầu
          </p>
        </div>
      )}

      {selectedProblems.length > 0 && (
        <div className="flex justify-between items-center pt-4 border-t">
          <span className="text-sm text-gray-600">
            Tổng số bài tập: <strong>{selectedProblems.length}</strong>
          </span>
          <span className="text-sm text-gray-600">
            Tổng điểm: <strong>{selectedProblems.reduce((sum, p) => sum + (p.point || 0), 0)}</strong>
          </span>
        </div>
      )}
    </div>
  );
};

export default ProblemContest;