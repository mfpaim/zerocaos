import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RequestList } from '@/components/RequestList';
import { DateIndicator } from '@/components/DateIndicator';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Check for date in URL params (from calendar page)
  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      setSelectedDate(new Date(dateParam));
    }
  }, [searchParams]);

  const clearDateFilter = () => {
    setSelectedDate(null);
    setSearchParams({});
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Gerencie as solicitações dos condomínios</p>
        </div>
        <DateIndicator clickable />
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

      <RequestList filterDate={selectedDate} />
    </div>
  );
};

export default Dashboard;
