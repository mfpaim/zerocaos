import { useState, useMemo } from 'react';
import { useRequests } from '@/hooks/useRequests';
import { DateIndicator } from '@/components/DateIndicator';
import { RequestFilters } from '@/components/RequestFilters';
import { KanbanCard } from '@/components/KanbanCard';
import { Request, Status } from '@/types/requests';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from 'lucide-react';
import { systemUsers } from '@/components/ScheduleDialog';
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

  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedRequestType, setSelectedRequestType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');

  const { calendarEvents } = useRequests();

  // Get requests assigned to the selected user via calendar events
  const userAssignedRequestIds = useMemo(() => {
    if (selectedUser === 'all') return null;
    return new Set(calendarEvents.filter(e => e.assignedTo === selectedUser).map(e => e.requestId));
  }, [calendarEvents, selectedUser]);

  const filteredRequests = useMemo(() => {
    return activeRequests.filter((req) => {
      if (userAssignedRequestIds && !userAssignedRequestIds.has(req.id)) return false;
      if (selectedGroup !== 'all' && req.groupId !== selectedGroup) return false;
      if (selectedCategory !== 'all' && req.category !== selectedCategory) return false;
      if (selectedPriority !== 'all' && req.priority !== selectedPriority) return false;
      if (selectedRequestType !== 'all' && req.requestType !== selectedRequestType) return false;
      if (selectedStatus !== 'all' && req.status !== selectedStatus) return false;
      return true;
    });
  }, [activeRequests, selectedGroup, selectedCategory, selectedPriority, selectedRequestType, selectedStatus]);

  const grouped = useMemo(() => {
    const map: Record<Status, Request[]> = {
      pendente: [],
      em_andamento: [],
      respondido: [],
      resolvido: [],
    };
    filteredRequests.forEach(req => {
      map[req.status].push(req);
    });
    Object.values(map).forEach(arr =>
      arr.sort((a, b) => b.priorityScore - a.priorityScore || b.timestamp.getTime() - a.timestamp.getTime())
    );
    return map;
  }, [filteredRequests]);

  return (
    <div className="p-4 lg:p-6 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kanban</h1>
          <p className="text-sm text-muted-foreground mt-1">Visualize solicitações por status</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Usuários</SelectItem>
                {systemUsers.map(u => (
                  <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DateIndicator />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <RequestFilters
          selectedGroup={selectedGroup}
          selectedCategory={selectedCategory}
          selectedPriority={selectedPriority}
          selectedRequestType={selectedRequestType}
          selectedStatus={selectedStatus}
          onGroupChange={setSelectedGroup}
          onCategoryChange={setSelectedCategory}
          onPriorityChange={setSelectedPriority}
          onRequestTypeChange={setSelectedRequestType}
          onStatusChange={setSelectedStatus}
        />
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map(col => (
          <div key={col.status} className={cn("rounded-lg border border-border p-3", col.bgColor)}>
            <div className="flex items-center gap-2 mb-4">
              <span className={cn("w-3 h-3 rounded-full", col.color)} />
              <h2 className="font-semibold text-foreground text-sm">{col.label}</h2>
              <span className="ml-auto text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                {grouped[col.status].length}
              </span>
            </div>

            <ScrollArea className="h-[calc(100vh-260px)]">
              <div className="space-y-2 pr-2">
                {grouped[col.status].length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">Nenhuma solicitação</p>
                ) : (
                  grouped[col.status].map(req => (
                    <KanbanCard key={req.id} request={req} />
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
