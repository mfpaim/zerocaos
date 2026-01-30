import { useMemo, useState } from 'react';
import { requests, groups } from '@/data/mockData';
import { Priority, priorityLabels, categoryLabels } from '@/types/requests';
import { subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

export type DateRange = '7d' | '14d' | '30d' | '90d';

export const dateRangeLabels: Record<DateRange, string> = {
  '7d': 'Últimos 7 dias',
  '14d': 'Últimos 14 dias',
  '30d': 'Últimos 30 dias',
  '90d': 'Últimos 90 dias',
};

// Simulated response times in minutes for each priority
const simulatedResponseTimes: Record<Priority, { min: number; max: number }> = {
  high: { min: 5, max: 30 },
  medium: { min: 30, max: 180 },
  low: { min: 60, max: 480 },
};

export const useStatistics = () => {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange>('7d');

  const dateRangeDays: Record<DateRange, number> = {
    '7d': 7,
    '14d': 14,
    '30d': 30,
    '90d': 90,
  };

  const filteredRequests = useMemo(() => {
    const now = new Date();
    const daysAgo = dateRangeDays[dateRange];
    const startDate = startOfDay(subDays(now, daysAgo - 1));
    const endDate = endOfDay(now);

    return requests.filter((req) => {
      const matchesGroup = selectedGroup === 'all' || req.groupId === selectedGroup;
      const matchesDate = isWithinInterval(new Date(req.timestamp), { start: startDate, end: endDate });
      return matchesGroup && matchesDate;
    });
  }, [selectedGroup, dateRange]);

  const getRequestsByDay = useMemo(() => {
    const daysAgo = dateRangeDays[dateRange];
    const days = Array.from({ length: Math.min(daysAgo, 14) }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (Math.min(daysAgo, 14) - 1 - i));
      return {
        date,
        label: date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
      };
    });

    return days.map(({ date, label }) => {
      const count = filteredRequests.filter((r) => {
        const reqDate = new Date(r.timestamp);
        return reqDate.toDateString() === date.toDateString();
      }).length;
      return { day: label, count };
    });
  }, [filteredRequests, dateRange]);

  const getRequestsByCategory = useMemo(() => {
    const categories = filteredRequests.reduce((acc, req) => {
      acc[req.category] = (acc[req.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories).map(([category, count]) => ({
      category,
      count,
      name: categoryLabels[category as keyof typeof categoryLabels] || category,
    }));
  }, [filteredRequests]);

  const getAverageResponseTimeByPriority = useMemo(() => {
    const priorityCounts: Record<Priority, number> = { high: 0, medium: 0, low: 0 };
    
    filteredRequests.forEach((req) => {
      priorityCounts[req.priority]++;
    });

    // Generate simulated average response times based on request count
    return (['high', 'medium', 'low'] as Priority[]).map((priority) => {
      const count = priorityCounts[priority];
      const { min, max } = simulatedResponseTimes[priority];
      
      // If no requests, show base average
      const avgMinutes = count > 0 
        ? min + Math.random() * (max - min) * 0.6 // Add some variance
        : (min + max) / 2;

      return {
        priority,
        name: priorityLabels[priority],
        avgMinutes: Math.round(avgMinutes),
        count,
        // Format for display
        formatted: avgMinutes < 60 
          ? `${Math.round(avgMinutes)} min` 
          : `${Math.round(avgMinutes / 60 * 10) / 10}h`,
      };
    });
  }, [filteredRequests]);

  const stats = useMemo(() => {
    const totalRequests = filteredRequests.length;
    const daysAgo = dateRangeDays[dateRange];
    const avgPerDay = totalRequests > 0 ? (totalRequests / daysAgo).toFixed(1) : '0';
    
    const categoryData = getRequestsByCategory;
    const mostCommonCategory = categoryData.length > 0
      ? categoryData.reduce((prev, curr) => (curr.count > prev.count ? curr : prev))
      : { name: '-', count: 0 };

    return {
      totalRequests,
      avgPerDay,
      mostCommonCategory,
    };
  }, [filteredRequests, dateRange, getRequestsByCategory]);

  return {
    selectedGroup,
    setSelectedGroup,
    dateRange,
    setDateRange,
    filteredRequests,
    getRequestsByDay,
    getRequestsByCategory,
    getAverageResponseTimeByPriority,
    stats,
    groups,
  };
};
