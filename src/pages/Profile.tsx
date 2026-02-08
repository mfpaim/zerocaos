import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Shield, CalendarDays, BarChart3, Building2, Clock, CheckCheck, AlertCircle, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/hooks/useUser';
import { useRequests } from '@/hooks/useRequests';
import { statusLabels } from '@/types/requests';
import { format, subDays, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { requests, calendarEvents } = useRequests();

  // Stats by status
  const statusStats = useMemo(() => {
    const counts = { pendente: 0, em_andamento: 0, respondido: 0, resolvido: 0 };
    requests.forEach(r => { counts[r.status]++; });
    return counts;
  }, [requests]);

  // Stats by group (top 5)
  const groupStats = useMemo(() => {
    const map: Record<string, number> = {};
    requests.forEach(r => { map[r.groupName] = (map[r.groupName] || 0) + 1; });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [requests]);

  // Recent activity (last 7 days)
  const recentCount = useMemo(() => {
    const cutoff = subDays(new Date(), 7);
    return requests.filter(r => isAfter(r.timestamp, cutoff)).length;
  }, [requests]);

  // Upcoming schedules for user
  const mySchedules = useMemo(() => {
    return calendarEvents
      .filter(e => e.assignedTo === user.name && isAfter(e.scheduledDate, subDays(new Date(), 1)))
      .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
      .slice(0, 5);
  }, [calendarEvents, user.name]);

  const total = requests.length;
  const resolvedPct = total > 0 ? Math.round((statusStats.resolvido / total) * 100) : 0;

  const statusIcons: Record<string, React.ReactNode> = {
    pendente: <AlertCircle className="h-4 w-4 text-muted-foreground" />,
    em_andamento: <Clock className="h-4 w-4 text-yellow-500" />,
    respondido: <MessageSquare className="h-4 w-4 text-blue-500" />,
    resolvido: <CheckCheck className="h-4 w-4 text-green-500" />,
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-24 w-24 ring-4 ring-primary/10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-3xl font-bold">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" /> {user.email}
                </span>
                <Badge variant="secondary" className="w-fit">
                  <Shield className="h-3 w-3 mr-1" /> Administrador
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Membro desde {format(new Date(2024, 0, 1), "MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-foreground">{total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-green-500">{resolvedPct}%</p>
            <p className="text-xs text-muted-foreground">Resolvidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-foreground">{recentCount}</p>
            <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-foreground">{mySchedules.length}</p>
            <p className="text-xs text-muted-foreground">Agendamentos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Por Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(Object.entries(statusStats) as [string, number][]).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {statusIcons[status]}
                  <span className="text-sm text-foreground">{statusLabels[status as keyof typeof statusLabels]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Groups */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Top Condomínios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {groupStats.map(([name, count], i) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}.</span>
                  <span className="text-sm text-foreground truncate">{name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">{count}</Badge>
              </div>
            ))}
            {groupStats.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Sem dados</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Schedules */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Próximos Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mySchedules.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum agendamento futuro</p>
            ) : (
              <div className="space-y-2">
                {mySchedules.map(evt => (
                  <div key={evt.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <Badge variant="outline" className="text-xs shrink-0">
                      {format(evt.scheduledDate, 'dd/MM')}
                    </Badge>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {evt.scheduledTime}
                    </Badge>
                    <span className="text-sm text-foreground truncate">{evt.note || 'Agendamento'}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
