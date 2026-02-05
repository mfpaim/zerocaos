import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RequestCalendar } from '@/components/RequestCalendar';
import { RequestCard } from '@/components/RequestCard';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { useRequests } from '@/hooks/useRequests';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Calendar = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { getActiveRequests } = useRequests();
  const activeRequests = getActiveRequests();

  // Filter requests by selected date
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
        </div>
      </div>

      {/* Main content - vertical layout */}
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Calendar with integrated stats */}
        <RequestCalendar onDateSelect={handleDateSelect} className="w-full" />

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
              {/* Pending requests */}
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

              {/* Resolved requests */}
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
