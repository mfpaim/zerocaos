import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Request, Category, Priority, RequestType, Status, categoryPriority, priorityScores } from '@/types/requests';
import { requests as initialRequests } from '@/data/mockData';

interface RequestsContextType {
  requests: Request[];
  archivedIds: Set<string>;
  archiveRequest: (id: string) => void;
  restoreRequest: (id: string) => void;
  deleteRequest: (id: string) => void;
  updateCategory: (id: string, category: Category) => void;
  updatePriority: (id: string, priority: Priority) => void;
  updateRequestType: (id: string, requestType: RequestType) => void;
  updateStatus: (id: string, status: Status) => void;
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

  const updateStatus = useCallback((id: string, status: Status) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status,
          isResolved: status === 'resolvido',
        };
      }
      return req;
    }));
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
      archiveRequest,
      restoreRequest,
      deleteRequest,
      updateCategory,
      updatePriority,
      updateRequestType,
      updateStatus,
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
  archiveRequest: () => {},
  restoreRequest: () => {},
  deleteRequest: () => {},
  updateCategory: () => {},
  updatePriority: () => {},
  updateRequestType: () => {},
  updateStatus: () => {},
  getActiveRequests: () => initialRequests,
  getArchivedRequests: () => [],
  getStatusCounts: () => ({ pendente: 0, em_andamento: 0, respondido: 0, resolvido: 0 }),
};

export function useRequests() {
  const context = useContext(RequestsContext);
  return context ?? defaultContext;
}
