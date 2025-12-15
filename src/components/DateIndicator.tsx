import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from 'lucide-react';

interface DateIndicatorProps {
  date?: Date;
  className?: string;
}

export function DateIndicator({ date = new Date(), className }: DateIndicatorProps) {
  const day = format(date, 'd');
  const month = format(date, 'MMM', { locale: ptBR });
  const year = format(date, 'yyyy');
  const weekday = format(date, 'EEEE', { locale: ptBR });

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2 px-3 py-2 bg-sidebar-accent rounded-lg border border-sidebar-border">
        <div className="flex flex-col items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground rounded-md px-2 py-1 min-w-[48px]">
          <span className="text-lg font-bold leading-none">{day}</span>
          <span className="text-[10px] uppercase leading-none mt-0.5">{month}</span>
        </div>
        <div className="flex flex-col text-sm">
          <span className="font-medium text-foreground capitalize">{weekday}</span>
          <span className="text-xs text-muted-foreground">{year}</span>
        </div>
        <Calendar className="h-4 w-4 text-muted-foreground ml-1" />
      </div>
    </div>
  );
}
