import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProblemForm from '@/components/admin/problems/ProblemForm';
import { getProblemById } from '@/services/problemService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';

const UpdateProblem = () => {
  const { id } = useParams();
  const [problemData, setProblemData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await getProblemById(id);
        setProblemData(response.data);
      } catch (error) {
        console.error('Error fetching problem:', error);
        toast.error('Không thể tải thông tin bài tập');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblem();
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <ProblemForm mode="edit" initialData={problemData} />;
};

export default UpdateProblem;