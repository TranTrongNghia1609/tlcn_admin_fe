import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { userStatsService } from '../services/userStatsService';

export const useUserAnalytics = (period = 'week') => {
  const [stats, setStats] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsResponse, timelineResponse] = await Promise.all([
          userStatsService.getOverviewStats(),
          userService.getUserRegistrationTimeline(period)
        ]);

        setStats(statsResponse.data);
        setTimelineData(timelineResponse.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.message || 'Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  return { stats, timelineData, loading, error };
};