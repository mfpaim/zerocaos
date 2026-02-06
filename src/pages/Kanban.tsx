import { useMemo } from 'react';
import { useRequests } from '@/hooks/useRequests';
import { RequestCard } from '@/components/RequestCard';
import { DateIndicator } from '@/components/DateIndicator';
import { Request, Status } from '@/types/requests';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const columns: { status: Status; label: string; color: string; bgColor: string }[] = [
  { status: 'pendente', label: 'Pendente', color: 'bg-gray-400', bgColor: 'bg-gray-400/10' },
  { status: 'em_andamento', label: 'Em Andamento', color: 'bg-yellow-500', bgColor: 'bg-yellow-500/10' },
  { status: 'respondido', label: 'Respondido', color: 'bg-blue-500', bgColor: 'bg-blue-500/10' },
  { status: 'resolvido', label: 'Resolvido', color: 'bg-green-500', bgColor: 'bg-green-500/10' },
];

export default function Kanban() {
  const { getActiveRequests } = useRequests();
  const activeRequests = getActiveRequests();

  const grouped = useMemo(() => {
    const map: Record<Status, Request[]> = {
      pendente: [],
      em_andamento: [],
      respondido: [],
      resolvido: [],
    };
    activeRequests.forEach(req => {
      map[req.status].push(req);
    });
    // Sort each column by priority score desc, then timestamp desc
    Object.values(map).forEach(arr =>
      arr.sort((a, b) => b.priorityScore - a.priorityScore || b.timestamp.getTime() - a.timestamp.getTime())
    );
    return map;
  }, [activeRequests]);

  return (
    <div className="p-4 lg:p-6 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kanban</h1>
          <p className="text-sm text-muted-foreground mt-1">Visualize solicitações por status</p>
        </div>
        <DateIndicator />
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map(col => (
          <div key={col.status} className={cn("rounded-lg border border-border p-3", col.bgColor)}>
            {/* Column header */}
            <div className="flex items-center gap-2 mb-4">
              <span className={cn("w-3 h-3 rounded-full", col.color)} />
              <h2 className="font-semibold text-foreground text-sm">{col.label}</h2>
              <span className="ml-auto text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                {grouped[col.status].length}
              </span>
            </div>

            {/* Column cards */}
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-3 pr-2">
                {grouped[col.status].length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">Nenhuma solicitação</p>
                ) : (
                  grouped[col.status].map(req => (
                    <RequestCard key={req.id} request={req} compact />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        ))}
      </div>
    </div>
  );
}
