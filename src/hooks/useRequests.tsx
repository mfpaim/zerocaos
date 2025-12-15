import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Request } from '@/types/requests';
import { requests as initialRequests } from '@/data/mockData';

interface RequestsContextType {
  requests: Request[];
  resolvedIds: Set<string>;
  archivedIds: Set<string>;
  markAsResolved: (id: string) => void;
  archiveRequest: (id: string) => void;
  deleteRequest: (id: string) => void;
  getActiveRequests: () => Request[];
  getArchivedRequests: () => Request[];
  resolvedCount: number;
}

const RequestsContext = createContext<RequestsContextType | null>(null);

export function RequestsProvider({ children }: { children: ReactNode }) {
  const [requests] = useState<Request[]>(initialRequests);
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
  getActiveRequests: () => initialRequests,
  getArchivedRequests: () => [],
  resolvedCount: 0,
};

export function useRequests() {
  const context = useContext(RequestsContext);
  return context ?? defaultContext;
}
