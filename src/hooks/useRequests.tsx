import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Request, Category, Priority, RequestType, Status, CalendarEvent, categoryPriority, priorityScores } from '@/types/requests';
import { requests as initialRequests } from '@/data/mockData';

interface RequestsContextType {
  requests: Request[];
  archivedIds: Set<string>;
  calendarEvents: CalendarEvent[];
  archiveRequest: (id: string) => void;
  restoreRequest: (id: string) => void;
  deleteRequest: (id: string) => void;
  updateCategory: (id: string, category: Category) => void;
  updatePriority: (id: string, priority: Priority) => void;
  updateRequestType: (id: string, requestType: RequestType) => void;
  updateStatus: (id: string, status: Status, userName?: string, comment?: string) => void;
  deleteStatusComment: (id: string, status: Status, commentIndex: number) => void;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  removeCalendarEvent: (eventId: string) => void;
  getActiveRequests: () => Request[];
  getArchivedRequests: () => Request[];
  getStatusCounts: () => Record<Status, number>;
}

const RequestsContext = createContext<RequestsContextType | null>(null);

export function RequestsProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<Request[]>(initialRequests);
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());

  const archiveRequest = useCallback((id: string) => {
    setArchivedIds(prev => new Set(prev).add(id));
  }, []);

  const restoreRequest = useCallback((id: string) => {
    setArchivedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const deleteRequest = useCallback((id: string) => {
    setArchivedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    setRequests(prev => prev.filter(req => req.id !== id));
  }, []);

  const updateCategory = useCallback((id: string, category: Category) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        const newPriority = categoryPriority[category];
        return {
          ...req,
          category,
          priority: newPriority,
          priorityScore: priorityScores[newPriority],
        };
      }
      return req;
    }));
  }, []);

  const updatePriority = useCallback((id: string, priority: Priority) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          priority,
          priorityScore: priorityScores[priority],
        };
      }
      return req;
    }));
  }, []);

  const updateRequestType = useCallback((id: string, requestType: RequestType) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          requestType,
        };
      }
      return req;
    }));
  }, []);

  const updateStatus = useCallback((id: string, status: Status, userName?: string, comment?: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        const existing = req.statusComments?.[status] || [];
        const updatedComments = {
          ...req.statusComments,
          [status]: comment ? [...existing, comment] : existing,
        };
        return {
          ...req,
          status,
          isResolved: status === 'resolvido',
          resolvedBy: status === 'resolvido' ? (userName || 'Administrador') : undefined,
          resolvedAt: status === 'resolvido' ? new Date() : undefined,
          statusComments: updatedComments,
        };
      }
      return req;
    }));
  }, []);

  const deleteStatusComment = useCallback((id: string, status: Status, commentIndex: number) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        const existing = [...(req.statusComments?.[status] || [])];
        existing.splice(commentIndex, 1);
        return {
          ...req,
          statusComments: { ...req.statusComments, [status]: existing },
        };
      }
      return req;
    }));
  }, []);

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  const addCalendarEvent = useCallback((event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = { ...event, id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
    setCalendarEvents(prev => [...prev, newEvent]);
  }, []);

  const removeCalendarEvent = useCallback((eventId: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== eventId));
  }, []);

  const getActiveRequests = useCallback(() => {
    return requests.filter(r => !archivedIds.has(r.id));
  }, [requests, archivedIds]);

  const getArchivedRequests = useCallback(() => {
    return requests.filter(r => archivedIds.has(r.id));
  }, [requests, archivedIds]);

  const getStatusCounts = useCallback(() => {
    const activeRequests = requests.filter(r => !archivedIds.has(r.id));
    return {
      pendente: activeRequests.filter(r => r.status === 'pendente').length,
      em_andamento: activeRequests.filter(r => r.status === 'em_andamento').length,
      respondido: activeRequests.filter(r => r.status === 'respondido').length,
      resolvido: activeRequests.filter(r => r.status === 'resolvido').length,
    };
  }, [requests, archivedIds]);

  return (
    <RequestsContext.Provider value={{
      requests,
      archivedIds,
      calendarEvents,
      archiveRequest,
      restoreRequest,
      deleteRequest,
      updateCategory,
      updatePriority,
      updateRequestType,
      updateStatus,
      deleteStatusComment,
      addCalendarEvent,
      removeCalendarEvent,
      getActiveRequests,
      getArchivedRequests,
      getStatusCounts,
    }}>
      {children}
    </RequestsContext.Provider>
  );
}

const defaultContext: RequestsContextType = {
  requests: initialRequests,
  archivedIds: new Set(),
  calendarEvents: [],
  archiveRequest: () => {},
  restoreRequest: () => {},
  deleteRequest: () => {},
  updateCategory: () => {},
  updatePriority: () => {},
  updateRequestType: () => {},
  updateStatus: () => {},
  deleteStatusComment: () => {},
  addCalendarEvent: () => {},
  removeCalendarEvent: () => {},
  getActiveRequests: () => initialRequests,
  getArchivedRequests: () => [],
  getStatusCounts: () => ({ pendente: 0, em_andamento: 0, respondido: 0, resolvido: 0 }),
};

export function useRequests() {
  const context = useContext(RequestsContext);
  return context ?? defaultContext;
}
