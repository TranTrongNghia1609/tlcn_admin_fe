import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getSubmissionById } from '@/services/submissionService';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, Database, Code2, Calendar, Hash, User, BookOpen, Trophy, Code, AlertCircle, CheckCircle } from 'lucide-react';

function Submision() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubmission = async () => {
      setLoading(true)
      try {
        const response = await getSubmissionById(id);
        setSubmission(response.data);
      }
      catch (error) {
        console.error('Error fetching submission:', error);
        toast.error('Không thể tải chi tiết bài nộp', {});
      }
      finally {
        setLoading(false)
      }
    };
    fetchSubmission();
  }, [id])

  if (loading){
    return <LoadingSpinner/>
  }

  if (!submission) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Không tìm thấy bài nộp</p>
      </div>
    );
  }

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

  const getLanguageName = (lang) => {
    const languages = {
      'cpp': 'C++',
      'java': 'Java',
      'python': 'Python',
      'javascript': 'JavaScript',
      'c': 'C'
    };
    return languages[lang] || lang;
  };

  return (
    <div className='p-4 space-y-4'>
      {/* Header Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Chi tiết bài nộp</h2>
              <p className="text-sm text-gray-500 mt-1">ID: {submission.shortId}</p>
            </div>
            {getStatusBadge(submission.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Người nộp</p>
                <p className="font-semibold">{submission.user.userName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Bài tập</p>
                <p className="font-semibold">{submission.problem.name} - {submission.problem.shortId}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Thời gian nộp</p>
                <p className="font-semibold">
                  {new Date(submission.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Kỳ thi</p>
                <p className="font-semibold">{submission.contest ? submission.contest?.title + " - " + submission.contest?.code: "Không trong kỳ thi"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Execution Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">Thời gian chạy</h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{submission.time} ms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold">Bộ nhớ</h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{submission.memory} MB</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold">Ngôn ngữ</h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{getLanguageName(submission.language)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Test Cases */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Kết quả kiểm tra</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Test cases đã qua</span>
              <span className="font-bold text-lg">
                {submission.passed} / {submission.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-500 h-2.5 rounded-full transition-all"
                style={{ width: `${(submission.passed / submission.total) * 100}%` }}
              ></div>
            </div>
            {submission.score > 0 && (
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-gray-600">Điểm số</span>
                <span className="font-bold text-lg text-blue-600">{submission.score}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Source Code */}
      {submission.source && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Mã nguồn</h3>
          </CardHeader>
          <CardContent className={'overflow-x-auto'}>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
              <code>{submission.source}</code>
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Submision