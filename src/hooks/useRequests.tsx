import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Request, Category, Priority, categoryPriority, priorityScores } from '@/types/requests';
import { requests as initialRequests } from '@/data/mockData';

interface RequestsContextType {
  requests: Request[];
  resolvedIds: Set<string>;
  archivedIds: Set<string>;
  markAsResolved: (id: string) => void;
  archiveRequest: (id: string) => void;
  deleteRequest: (id: string) => void;
  updateCategory: (id: string, category: Category) => void;
  updatePriority: (id: string, priority: Priority) => void;
  getActiveRequests: () => Request[];
  getArchivedRequests: () => Request[];
  resolvedCount: number;
}

const RequestsContext = createContext<RequestsContextType | null>(null);

export function RequestsProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<Request[]>(initialRequests);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());

  const markAsResolved = useCallback((id: string) => {
    setResolvedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const archiveRequest = useCallback((id: string) => {
    setArchivedIds(prev => new Set(prev).add(id));
  }, []);

  const deleteRequest = useCallback((id: string) => {
    setArchivedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
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

  const getActiveRequests = useCallback(() => {
    return requests.filter(r => !archivedIds.has(r.id));
  }, [requests, archivedIds]);

  const getArchivedRequests = useCallback(() => {
    return requests.filter(r => archivedIds.has(r.id));
  }, [requests, archivedIds]);

  const resolvedCount = resolvedIds.size;

  return (
    <RequestsContext.Provider value={{
      requests,
      resolvedIds,
      archivedIds,
      markAsResolved,
      archiveRequest,
      deleteRequest,
      updateCategory,
      updatePriority,
      getActiveRequests,
      getArchivedRequests,
      resolvedCount,
    }}>
      {children}
    </RequestsContext.Provider>
  );
}

const defaultContext: RequestsContextType = {
  requests: initialRequests,
  resolvedIds: new Set(),
  archivedIds: new Set(),
  markAsResolved: () => {},
  archiveRequest: () => {},
  deleteRequest: () => {},
  updateCategory: () => {},
  updatePriority: () => {},
  getActiveRequests: () => initialRequests,
  getArchivedRequests: () => [],
  resolvedCount: 0,
};

export function useRequests() {
  const context = useContext(RequestsContext);
  return context ?? defaultContext;
}
