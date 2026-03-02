import { useParams, useNavigate } from 'react-router-dom';
import { requests } from '@/data/mockData';
import { groups } from '@/data/mockData';
import { useRequests } from '@/hooks/useRequests';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ArrowLeft, MessageSquare, Clock, CheckCircle, AlertTriangle,
  BarChart3, CalendarDays, Building2, TrendingUp, User
} from 'lucide-react';
import {
  categoryLabels, priorityLabels, statusLabels,
  Status, Category, Priority
} from '@/types/requests';
import { format, differenceInHours, subDays, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusColors: Record<Status, string> = {
  pendente: 'bg-[hsl(var(--priority-high))]',
  em_andamento: 'bg-[hsl(var(--priority-medium))]',
  respondido: 'bg-[hsl(var(--sidebar-primary))]',
  resolvido: 'bg-[hsl(var(--priority-low))]',
};

const ResidentDashboard = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { archivedIds, calendarEvents } = useRequests();

  const decodedName = decodeURIComponent(name || '');

  // All requests from this resident
  const residentRequests = requests.filter(
    r => r.senderName === decodedName && !archivedIds.has(r.id)
  );

  if (residentRequests.length === 0) {
    // Check if resident exists as a group member
    const isMember = groups.some(g => g.members.some(m => m.name === decodedName));
    if (!isMember && residentRequests.length === 0) {
      return (
        <div className="p-8 text-center">
          <User className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">Morador não encontrado.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
        </div>
      );
    }
  }

  const total = residentRequests.length;

  // Groups this resident belongs to
  const residentGroups = groups.filter(g =>
    g.members.some(m => m.name === decodedName) ||
    residentRequests.some(r => r.groupId === g.id)
  );

  // Member info from groups
  const memberInfo = groups
    .flatMap(g => g.members)
    .find(m => m.name === decodedName);

  // Status counts
  const statusCounts: Record<Status, number> = {
    pendente: residentRequests.filter(r => r.status === 'pendente').length,
    em_andamento: residentRequests.filter(r => r.status === 'em_andamento').length,
    respondido: residentRequests.filter(r => r.status === 'respondido').length,
    resolvido: residentRequests.filter(r => r.status === 'resolvido').length,
  };

  // Category breakdown
  const categoryMap = residentRequests.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topCategories = Object.entries(categoryMap)
    .sort(([, a], [, b]) => b - a);

  // Priority breakdown
  const priorityCounts: Record<Priority, number> = {
    high: residentRequests.filter(r => r.priority === 'high').length,
    medium: residentRequests.filter(r => r.priority === 'medium').length,
    low: residentRequests.filter(r => r.priority === 'low').length,
  };

  // Resolution rate
  const resolutionRate = total > 0 ? Math.round((statusCounts.resolvido / total) * 100) : 0;

  // Recent activity (last 7 days)
  const recentRequests = residentRequests.filter(r => isAfter(r.timestamp, subDays(new Date(), 7)));

  // Hour distribution
  const hourMap = residentRequests.reduce((acc, r) => {
    const hour = r.timestamp.getHours();
    const period = hour < 6 ? 'Madrugada (0h-6h)' :
      hour < 12 ? 'Manhã (6h-12h)' :
      hour < 18 ? 'Tarde (12h-18h)' : 'Noite (18h-0h)';
    acc[period] = (acc[period] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Request type breakdown
  const typeMap = residentRequests.reduce((acc, r) => {
    acc[r.requestType] = (acc[r.requestType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const typeLabels: Record<string, string> = {
    reclamacao: 'Reclamações',
    sugestao: 'Sugestões',
    solicitacao: 'Solicitações',
  };

  // Calendar events for this resident's requests
  const residentEventIds = new Set(residentRequests.map(r => r.id));
  const residentEvents = calendarEvents.filter(e => residentEventIds.has(e.requestId));

  // Initials
  const initials = decodedName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Avg wait for pending
  const pendingRequests = residentRequests.filter(r => r.status === 'pendente');
  const avgWaitHours = pendingRequests.length > 0
    ? Math.round(pendingRequests.reduce((sum, r) => sum + differenceInHours(new Date(), r.timestamp), 0) / pendingRequests.length)
    : 0;

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-14 w-14 border-2 border-primary/20">
          <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--sidebar-brand-start)/0.3)] to-[hsl(var(--sidebar-brand-end)/0.3)] text-foreground text-lg font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{decodedName}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {residentGroups.map(g => (
              <Badge
                key={g.id}
                variant="outline"
                className="text-xs cursor-pointer hover:bg-accent"
                onClick={() => navigate(`/grupos/${g.id}`)}
              >
                <Building2 className="h-3 w-3 mr-1" />
                {g.name}
              </Badge>
            ))}
            {memberInfo && (
              <span className="text-xs text-muted-foreground">
                · {memberInfo.participationCount} participações
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{total}</p>
              <p className="text-xs text-muted-foreground">Total Solicitações</p>
            </div>
          </div>
        </Card>
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown */}
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Status das Solicitações
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

        {/* Categories */}
        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            Categorias
          </h3>
          {topCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma solicitação.</p>
          ) : (
            <div className="space-y-3">
              {topCategories.map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {categoryLabels[cat as Category] || cat}
                  </Badge>
                  <span className="text-sm font-semibold text-foreground">{count}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hour distribution */}
        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Horários das Solicitações
          </h3>
          <div className="space-y-3">
            {['Madrugada (0h-6h)', 'Manhã (6h-12h)', 'Tarde (12h-18h)', 'Noite (18h-0h)'].map(period => {
              const count = hourMap[period] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={period} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{period}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/70 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Type breakdown */}
        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Tipos de Solicitação
          </h3>
          <div className="space-y-3">
            {Object.entries(typeLabels).map(([key, label]) => {
              const count = typeMap[key] || 0;
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{label}</span>
                  <Badge variant="secondary" className="text-xs">{count}</Badge>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Schedules */}
        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            Agendamentos Relacionados
          </h3>
          {residentEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum agendamento.</p>
          ) : (
            <ScrollArea className="max-h-40">
              <div className="space-y-3">
                {residentEvents.map(evt => (
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

      {/* All Messages */}
      <Card className="p-5">
        <h3 className="font-semibold text-foreground mb-4">Todas as Mensagens</h3>
        {residentRequests.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma mensagem registrada.</p>
        ) : (
          <ScrollArea className="max-h-80">
            <div className="space-y-3">
              {residentRequests
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .map(req => (
                  <div key={req.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                      req.priority === 'high' ? 'bg-[hsl(var(--priority-high))]' :
                      req.priority === 'medium' ? 'bg-[hsl(var(--priority-medium))]' :
                      'bg-[hsl(var(--priority-low))]'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 cursor-pointer hover:bg-accent"
                          onClick={() => navigate(`/grupos/${req.groupId}`)}
                        >
                          {req.groupName}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {categoryLabels[req.category]}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {statusLabels[req.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground">{req.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(req.timestamp, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
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

export default ResidentDashboard;
