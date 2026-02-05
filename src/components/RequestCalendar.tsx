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
  const { requests } = useRequests();

  // Calculate stats per day
  const dayStats = useMemo(() => {
    const stats = new Map<string, { total: number; resolved: number; pending: number }>();
    
    requests.forEach(req => {
      const dateKey = format(req.timestamp, 'yyyy-MM-dd');
      const existing = stats.get(dateKey) || { total: 0, resolved: 0, pending: 0 };
      existing.total++;
      if (req.status === 'resolvido') {
        existing.resolved++;
      } else {
        existing.pending++;
      }
      stats.set(dateKey, existing);
    });
    
    return stats;
  }, [requests]);

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
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Calendar section */}
        <div className="flex-1">
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
            className="rounded-md border w-full"
          />
        </div>

        {/* Selected day panel - like a calendar day view */}
        <div className="lg:w-48 flex flex-col">
          {selectedDate && (
            <div className="flex-1 bg-muted/30 rounded-lg p-4 border">
              {/* Day number - big like a calendar page */}
              <div className="text-center mb-3">
                <p className="text-5xl font-bold text-foreground leading-none">
                  {format(selectedDate, 'd')}
                </p>
                <p className="text-sm text-muted-foreground mt-1 capitalize">
                  {format(selectedDate, "EEEE", { locale: ptBR })}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {format(selectedDate, "MMMM yyyy", { locale: ptBR })}
                </p>
              </div>

              {/* Stats */}
              <div className="space-y-2 mt-4">
                {selectedDateStats ? (
                  <>
                    <div className="flex items-center justify-between p-2 rounded bg-priority-high-bg">
                      <span className="text-sm text-foreground">Pendentes</span>
                      <span className="text-lg font-bold text-priority-high">{selectedDateStats.pending}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-priority-low-bg">
                      <span className="text-sm text-foreground">Resolvidas</span>
                      <span className="text-lg font-bold text-priority-low">{selectedDateStats.resolved}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Sem solicitações
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mt-3 pt-3 border-t">
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
        </div>
      </div>
    </Card>
  );
}
