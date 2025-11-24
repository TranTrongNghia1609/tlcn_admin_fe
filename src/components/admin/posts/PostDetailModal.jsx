import React, { useEffect, useRef, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useUser } from '@/context/UserContext';
import PostHeader from '@/components/home/PostComponent/PostHeader';
import PostContent from '@/components/home/PostComponent/PostContent';
import PostActions from '@/components/home/PostComponent/PostActions';
import CommentSection from '@/components/home/CommentSection';
import { CommentForm } from '@/components/home/CommentComponent';
import * as postService from '../../../services/postService';
import LoadingSpinner from '../../common/LoadingSpinner';

const PostDetailModal = ({ 
  postId,
  isOpen, 
  onClose,
  onLike,
  onBookmark,
  onShare,
  onEdit,
  onDelete,
  isLiking,
  realTimeCommentsCount,
  onCreateComment,
  submitting
}) => {
  const modalRef = useRef(null);
  const { user } = useUser();
  const [mentionUser, setMentionUser] = useState(null);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch post detail
  useEffect(() => {
    if (isOpen && postId) {
      fetchPostDetail();
    }

    return () => {
      setPost(null);
      setError(null);
    };
  }, [isOpen, postId]);

  const fetchPostDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await postService.getAdminPostDetail(postId);
      setPost(response.data);
    } catch (err) {
      console.error('Error fetching post detail:', err);
      setError(err.message || 'Không thể tải thông tin bài viết');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
      
      if (post?.author && post.author.userName !== user?.userName) {
        setMentionUser(post.author);
      }
    } else {
      setMentionUser(null);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, post?.author, user?.userName]);

  if (!isOpen) return null;

  const mentionDisplayName = mentionUser?.fullName || mentionUser?.userName;
  const authorName = post?.author?.fullName || post?.author?.userName || 'Unknown User';

  return (
    <>
      {/* Backdrop with fade animation */}
      <div 
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Modal with slide from right animation - 1/3 width */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-2/3 md:w-1/2 lg:w-[600px] xl:w-[700px] z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div 
          ref={modalRef}
          className="relative bg-white h-full flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            {/* Empty div for spacing */}
            <div className="w-10"></div>
            
            {/* Title - Centered */}
            <h2 className="text-lg font-semibold text-gray-900 text-center flex-1">
              {loading ? 'Đang tải...' : `Bài viết của ${authorName}`}
            </h2>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              aria-label="Close modal"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full p-6">
                <div className="text-red-500 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg font-semibold text-center">{error}</p>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Đóng
                </button>
              </div>
            ) : post ? (
              <div className="bg-white">
                <PostHeader
                  post={post}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
                
                <PostContent
                  post={post}
                  isExpanded={true}
                />
                
                <PostActions
                  post={{
                    ...post,
                    commentsCount: realTimeCommentsCount || post.commentsCount
                  }}
                  onLike={onLike}
                  onToggleComments={() => {}}
                  onBookmark={onBookmark}
                  onShare={onShare}
                  showComments={true}
                  isLiking={isLiking}
                  hideCommentButton={true}
                />
                
                <CommentSection 
                  postId={post._id}
                  hideCommentForm={true}
                />
              </div>
            ) : null}
          </div>

          {/* Footer */}
          {post && (
            <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-white p-4">
              {user ? (
                <CommentForm
                  onSubmit={onCreateComment}
                  placeholder={mentionDisplayName ? `Reply to ${mentionDisplayName}...` : "Write a comment..."}
                  submitting={submitting}
                  size="normal"
                  user={user}
                  mentionUser={mentionUser}
                />
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-500 text-sm">
                    Please{' '}
                    <button
                      className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                      onClick={() => window.location.href = '/login'}
                    >
                      login
                    </button>
                    {' '}to post a comment
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PostDetailModal;