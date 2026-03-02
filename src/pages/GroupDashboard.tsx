import { useParams, useNavigate, Link } from 'react-router-dom';
import { groups, requests } from '@/data/mockData';
import { useRequests } from '@/hooks/useRequests';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft, Users, AlertTriangle, CheckCircle, Clock, MessageSquare,
  TrendingUp, BarChart3, CalendarDays, ShieldAlert
} from 'lucide-react';
import { categoryLabels, priorityLabels, statusLabels, Status, Category, Priority } from '@/types/requests';
import { format, differenceInHours, subDays, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusColors: Record<Status, string> = {
  pendente: 'bg-[hsl(var(--priority-high))]',
  em_andamento: 'bg-[hsl(var(--priority-medium))]',
  respondido: 'bg-[hsl(var(--sidebar-primary))]',
  resolvido: 'bg-[hsl(var(--priority-low))]',
};

const priorityColors: Record<Priority, string> = {
  high: 'text-[hsl(var(--priority-high))]',
  medium: 'text-[hsl(var(--priority-medium))]',
  low: 'text-[hsl(var(--priority-low))]',
};

const GroupDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { archivedIds, calendarEvents } = useRequests();

  const group = groups.find(g => g.id === id);
  if (!group) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Grupo não encontrado.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/grupos')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  const groupRequests = requests.filter(r => r.groupId === group.id);
  const activeRequests = groupRequests.filter(r => !archivedIds.has(r.id));
  const total = activeRequests.length;

  // Status counts
  const statusCounts: Record<Status, number> = {
    pendente: activeRequests.filter(r => r.status === 'pendente').length,
    em_andamento: activeRequests.filter(r => r.status === 'em_andamento').length,
    respondido: activeRequests.filter(r => r.status === 'respondido').length,
    resolvido: activeRequests.filter(r => r.status === 'resolvido').length,
  };

  // Priority counts
  const priorityCounts: Record<Priority, number> = {
    high: activeRequests.filter(r => r.priority === 'high').length,
    medium: activeRequests.filter(r => r.priority === 'medium').length,
    low: activeRequests.filter(r => r.priority === 'low').length,
  };

  // Category breakdown
  const categoryMap = activeRequests.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topCategories = Object.entries(categoryMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Resolution rate
  const resolutionRate = total > 0 ? Math.round((statusCounts.resolvido / total) * 100) : 0;

  // Avg response time (hours from timestamp to now for pending)
  const pendingRequests = activeRequests.filter(r => r.status === 'pendente');
  const avgWaitHours = pendingRequests.length > 0
    ? Math.round(pendingRequests.reduce((sum, r) => sum + differenceInHours(new Date(), r.timestamp), 0) / pendingRequests.length)
    : 0;

  // Recent activity (last 7 days)
  const recentRequests = activeRequests.filter(r => isAfter(r.timestamp, subDays(new Date(), 7)));

  // Top senders
  const senderMap = activeRequests.reduce((acc, r) => {
    acc[r.senderName] = (acc[r.senderName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topSenders = Object.entries(senderMap).sort(([, a], [, b]) => b - a).slice(0, 5);

  // Scheduled events for this group
  const groupEventRequestIds = new Set(activeRequests.map(r => r.id));
  const groupEvents = calendarEvents.filter(e => groupEventRequestIds.has(e.requestId));

  // Active members (with activity)
  const activeMembers = group.members.filter(m => m.participationCount > 3);

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/grupos')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{group.name}</h1>
            <Badge variant={group.isActive ? 'default' : 'secondary'}>
              {group.isActive ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {group.members.length} participantes · {total} solicitações ativas
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[hsl(var(--priority-high)/0.1)]">
              <AlertTriangle className="h-5 w-5 text-[hsl(var(--priority-high))]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{statusCounts.pendente}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[hsl(var(--priority-medium)/0.1)]">
              <Clock className="h-5 w-5 text-[hsl(var(--priority-medium))]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{avgWaitHours}h</p>
              <p className="text-xs text-muted-foreground">Espera Média</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[hsl(var(--priority-low)/0.1)]">
              <CheckCircle className="h-5 w-5 text-[hsl(var(--priority-low))]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{resolutionRate}%</p>
              <p className="text-xs text-muted-foreground">Resolvidos</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[hsl(var(--sidebar-primary)/0.1)]">
              <TrendingUp className="h-5 w-5 text-[hsl(var(--sidebar-primary))]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{recentRequests.length}</p>
              <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown */}
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Distribuição por Status
          </h3>
          <div className="space-y-4">
            {(Object.keys(statusCounts) as Status[]).map(status => {
              const count = statusCounts[status];
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-medium">{statusLabels[status]}</span>
                    <span className="text-muted-foreground">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${statusColors[status]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Priority Breakdown */}
        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
            Por Prioridade
          </h3>
          <div className="space-y-4">
            {(Object.keys(priorityCounts) as Priority[]).map(priority => {
              const count = priorityCounts[priority];
              return (
                <div key={priority} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${priorityColors[priority]}`}>{count}</span>
                    <span className="text-sm text-foreground">{priorityLabels[priority]}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: count }).map((_, i) => (
                      <div key={i} className={`w-2 h-6 rounded-sm ${
                        priority === 'high' ? 'bg-[hsl(var(--priority-high))]' :
                        priority === 'medium' ? 'bg-[hsl(var(--priority-medium))]' :
                        'bg-[hsl(var(--priority-low))]'
                      }`} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Categories */}
        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            Categorias mais Frequentes
          </h3>
          {topCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma solicitação.</p>
          ) : (
            <div className="space-y-3">
              {topCategories.map(([cat, count], i) => (
                <div key={cat} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}.</span>
                    <Badge variant="outline" className="text-xs">
                      {categoryLabels[cat as Category] || cat}
                    </Badge>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{count}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top Senders */}
        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Moradores mais Ativos
          </h3>
          {topSenders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum morador.</p>
          ) : (
            <div className="space-y-3">
              {topSenders.map(([name, count]) => (
                <div key={name} className="flex items-center justify-between">
                  <Link to={`/morador/${encodeURIComponent(name)}`} className="text-sm text-foreground truncate hover:text-primary hover:underline">{name}</Link>
                  <Badge variant="secondary" className="text-xs">{count} msg</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming Schedules */}
        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            Agendamentos
          </h3>
          {groupEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum agendamento para este grupo.</p>
          ) : (
            <ScrollArea className="max-h-40">
              <div className="space-y-3">
                {groupEvents.map(evt => (
                  <div key={evt.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-foreground">{evt.assignedTo}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(evt.scheduledDate), "dd/MM", { locale: ptBR })} às {evt.scheduledTime}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">Agendado</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </Card>
      </div>

      {/* Recent Requests */}
      <Card className="p-5">
        <h3 className="font-semibold text-foreground mb-4">Solicitações Recentes</h3>
        {activeRequests.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem solicitações.</p>
        ) : (
          <ScrollArea className="max-h-64">
            <div className="space-y-3">
              {activeRequests
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .slice(0, 8)
                .map(req => (
                  <div key={req.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                      req.priority === 'high' ? 'bg-[hsl(var(--priority-high))]' :
                      req.priority === 'medium' ? 'bg-[hsl(var(--priority-medium))]' :
                      'bg-[hsl(var(--priority-low))]'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link to={`/morador/${encodeURIComponent(req.senderName)}`} className="text-sm font-medium text-foreground hover:text-primary hover:underline">{req.senderName}</Link>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {statusLabels[req.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{req.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(req.timestamp, "dd/MM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>
        )}
      </Card>
    </div>
  );
};

export default GroupDashboard;
