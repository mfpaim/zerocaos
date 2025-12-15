import { useState } from 'react';
import { RequestList } from '@/components/RequestList';
import { RequestCalendar } from '@/components/RequestCalendar';
import { DateIndicator } from '@/components/DateIndicator';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const clearDateFilter = () => {
    setSelectedDate(null);
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Gerencie as solicitações dos condomínios</p>
        </div>
        <DateIndicator />
      </div>

      {selectedDate && (
        <div className="mb-4 p-3 bg-muted rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium">
            Exibindo solicitações de: {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </span>
          <Button variant="ghost" size="sm" onClick={clearDateFilter}>
            <X className="h-4 w-4 mr-1" />
            Limpar filtro
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <RequestList filterDate={selectedDate} />
        <div className="order-first xl:order-last">
          <RequestCalendar onDateSelect={handleDateSelect} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
