import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RequestCalendar } from '@/components/RequestCalendar';
import { RequestCard } from '@/components/RequestCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CalendarDays, Clock, User, X } from 'lucide-react';
import { useRequests } from '@/hooks/useRequests';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { systemUsers } from '@/components/ScheduleDialog';

const Calendar = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const { getActiveRequests, calendarEvents, requests, removeCalendarEvent } = useRequests();
  const activeRequests = getActiveRequests();

  // Calendar events for the selected date (and optionally user)
  const eventsForDate = useMemo(() => {
    return calendarEvents
      .filter(evt => isSameDay(evt.scheduledDate, selectedDate))
      .filter(evt => selectedUser === 'all' || evt.assignedTo === selectedUser);
  }, [calendarEvents, selectedDate, selectedUser]);

  // Requests that match the events
  const scheduledRequests = useMemo(() => {
    return eventsForDate.map(evt => {
      const req = requests.find(r => r.id === evt.requestId);
      return { event: evt, request: req };
    }).filter(item => item.request);
  }, [eventsForDate, requests]);

  // Non-scheduled requests for the date
  const filteredRequests = useMemo(() => {
    return activeRequests
      .filter(req => isSameDay(req.timestamp, selectedDate))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [activeRequests, selectedDate]);

  const pendingRequests = filteredRequests.filter(req => req.status !== 'resolvido');
  const resolvedRequests = filteredRequests.filter(req => req.status === 'resolvido');

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Dashboard
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
              <CalendarDays className="h-8 w-8 text-sidebar-primary" />
              Calendário de Solicitações
            </h1>
            <p className="text-muted-foreground mt-1">Navegue pelas solicitações clicando nos dias</p>
          </div>

          {/* User filter */}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Calendário Geral</SelectItem>
                {systemUsers.map(u => (
                  <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto space-y-6">
        <RequestCalendar onDateSelect={handleDateSelect} className="w-full" />

        {/* Scheduled events for this date */}
        {scheduledRequests.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Agendamentos de {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
              {selectedUser !== 'all' && (
                <Badge variant="secondary" className="ml-2">{selectedUser}</Badge>
              )}
            </h2>
            <div className="grid gap-3">
              {scheduledRequests.map(({ event, request }) => (
                <Card key={event.id} className="p-4 border-l-4 border-l-primary bg-primary/5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {event.scheduledTime}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <User className="h-3 w-3 mr-1" />
                          {event.assignedTo}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-foreground">{request!.groupName}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">{request!.message}</p>
                      {event.note && (
                        <p className="text-xs text-muted-foreground mt-1 italic">📝 {event.note}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Agendado por {event.assignedBy}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => removeCalendarEvent(event.id)}
                      title="Remover agendamento"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Request list for selected date */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Solicitações de {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filteredRequests.length} {filteredRequests.length === 1 ? 'solicitação' : 'solicitações'}
            </span>
          </div>

          {filteredRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Nenhuma solicitação neste dia</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Selecione outro dia no calendário</p>
            </Card>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              {pendingRequests.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-priority-high flex items-center gap-2 px-2 sticky top-0 bg-background py-2">
                    <span className="w-2 h-2 rounded-full bg-priority-high"></span>
                    Pendentes ({pendingRequests.length})
                  </p>
                  {pendingRequests.map(request => (
                    <RequestCard 
                      key={request.id} 
                      request={request}
                      onFilterChange={() => {}}
                    />
                  ))}
                </div>
              )}

              {resolvedRequests.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-sm font-medium text-priority-low flex items-center gap-2 px-2 sticky top-0 bg-background py-2">
                    <span className="w-2 h-2 rounded-full bg-priority-low"></span>
                    Resolvidas ({resolvedRequests.length})
                  </p>
                  {resolvedRequests.map(request => (
                    <RequestCard 
                      key={request.id} 
                      request={request}
                      onFilterChange={() => {}}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
