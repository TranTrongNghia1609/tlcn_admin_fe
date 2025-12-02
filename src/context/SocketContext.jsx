import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { toast } from 'sonner';

const SocketContext = createContext(null);

export const SocketProvider = ({ children, url }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestNotification, setLatestNotification] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    if (!token) {
      console.log('❌ No token found, skipping socket connection');
      return;
    }

    socketRef.current = io(url, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      auth: {
        token: token,
      }
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Socket connected');
      socketRef.current.emit('register');
    });

    socketRef.current.on('connected', (data) => {
      console.log('✅ Registered with notification system:', data);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('❌ Socket disconnected');
    });

    socketRef.current.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    // Lắng nghe thông báo bài đăng mới
    socketRef.current.on('new-post-published', (data) => {
      console.log('📥 Received new post notification:', data);
      setLatestNotification(data);
      
      // Tăng số thông báo chưa đọc
      setUnreadCount(prev => prev + 1);

      // Hiển thị toast notification
      toast.info('📝 Bài viết mới', {
        description: data.message || `${data.author?.fullName} đã đăng bài mới`,
        duration: 5000,
        action: {
          label: 'Xem ngay',
          onClick: () => {
            window.location.href = `/home?postId=${data.postId}`;
          }
        }
      });
    });

    // Lắng nghe submission update
    socketRef.current.on('submission-update', (data) => {
      console.log('📥 Received submission update:', data);

      if (data.status === 'Accepted') {
        toast.success('Nộp bài thành công', {
          description: `Runtime: ${data.time}ms | Memory: ${data.memory}KB`,
          duration: 5000
        });
      } else if (data.status === 'Wrong Answer') {
        toast.error('Wrong Answer', {
          description: `Passed: ${data.passed || 0}/${data.total || 10} test cases`,
          duration: 5000
        });
      } else if (data.status === 'Time Limit Exceeded') {
        toast.warning('⏱️ Time Limit Exceeded', {
          duration: 5000
        });
      } else if (data.status === 'Memory Limit Exceeded') {
        toast.warning('💾 Memory Limit Exceeded', {
          duration: 5000
        });
      } else if (data.status === 'Compilation Error') {
        toast.error('🔧 Compilation Error', {
          duration: 5000
        });
      } else if (data.status === 'Runtime Error') {
        toast.error('⚠️ Runtime Error', {
          duration: 5000
        });
      } else if (data.status !== 'Pending') {
        toast.error(`❌ ${data.status}`, {
          duration: 5000
        });
      }
    });

    // Lắng nghe contest notifications
    socketRef.current.on('contest-announcement', (data) => {
      console.log('📥 Received contest announcement:', data);
      
      toast.info('🏆 Thông báo cuộc thi', {
        description: data.message,
        duration: 6000
      });
    });

    // Lắng nghe khi đánh dấu đã đọc thành công
    socketRef.current.on('notification-read-success', (data) => {
      console.log('✅ Notification marked as read:', data.notificationId);
      setUnreadCount(prev => Math.max(0, prev - 1));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('🔌 Socket disconnected on cleanup');
      }
    };
  }, [url, token]);

  const emit = (event, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('⚠️ Socket not connected, cannot emit event:', event);
    }
  };

  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  // Join contest room
  const joinContest = (contestId) => {
    emit('join-contest', { contestId });
  };

  // Mark notification as read
  const markNotificationAsRead = (notificationId) => {
    emit('mark-notification-read', { notificationId });
  };

  return (
    <SocketContext.Provider 
      value={{ 
        socket: socketRef.current, 
        isConnected, 
        emit, 
        on, 
        off,
        latestNotification,
        unreadCount,
        setUnreadCount,
        joinContest,
        markNotificationAsRead
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};