import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRequests } from '@/hooks/useRequests';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RequestCalendarProps {
  onDateSelect?: (date: Date) => void;
  className?: string;
}

export function RequestCalendar({ onDateSelect, className }: RequestCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { requests, resolvedIds } = useRequests();

  // Calculate stats per day
  const dayStats = useMemo(() => {
    const stats = new Map<string, { total: number; resolved: number; pending: number }>();
    
    requests.forEach(req => {
      const dateKey = format(req.timestamp, 'yyyy-MM-dd');
      const existing = stats.get(dateKey) || { total: 0, resolved: 0, pending: 0 };
      existing.total++;
      if (resolvedIds.has(req.id)) {
        existing.resolved++;
      } else {
        existing.pending++;
      }
      stats.set(dateKey, existing);
    });
    
    return stats;
  }, [requests, resolvedIds]);

  const selectedDateStats = selectedDate 
    ? dayStats.get(format(selectedDate, 'yyyy-MM-dd')) 
    : null;

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && onDateSelect) {
      onDateSelect(date);
    }
  };

  // Custom day content to show indicators
  const modifiers = useMemo(() => {
    const hasRequests: Date[] = [];
    const hasResolved: Date[] = [];
    const hasPending: Date[] = [];

    dayStats.forEach((stats, dateKey) => {
      const date = new Date(dateKey);
      if (stats.total > 0) hasRequests.push(date);
      if (stats.resolved > 0) hasResolved.push(date);
      if (stats.pending > 0) hasPending.push(date);
    });

    return { hasRequests, hasResolved, hasPending };
  }, [dayStats]);

  return (
    <Card className={`p-4 ${className || ''}`}>
      <h3 className="font-semibold text-foreground mb-4">Calendário de Solicitações</h3>
      
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
        locale={ptBR}
        modifiers={modifiers}
        modifiersStyles={{
          hasRequests: { fontWeight: 'bold' },
          hasPending: { backgroundColor: 'hsl(var(--priority-high-bg))' },
          hasResolved: { backgroundColor: 'hsl(var(--priority-low-bg))' },
        }}
        className="rounded-md border"
      />

      {selectedDate && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-foreground">
            {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
          {selectedDateStats ? (
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-muted">
                {selectedDateStats.total} solicitações
              </Badge>
              <Badge className="bg-priority-low text-primary-foreground">
                {selectedDateStats.resolved} resolvidas
              </Badge>
              <Badge className="bg-priority-high text-primary-foreground">
                {selectedDateStats.pending} pendentes
              </Badge>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma solicitação neste dia</p>
          )}
          
          {selectedDateStats && selectedDateStats.total > 0 && (
            <button
              onClick={() => onDateSelect?.(selectedDate)}
              className="text-sm text-primary hover:underline"
            >
              Ver solicitações do dia →
            </button>
          )}
        </div>
      )}

      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-muted-foreground mb-2">Legenda:</p>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-priority-high-bg border"></div>
            <span>Pendentes</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-priority-low-bg border"></div>
            <span>Resolvidas</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
