import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RequestCalendar } from '@/components/RequestCalendar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Calendar = () => {
  const navigate = useNavigate();

  const handleDateSelect = (date: Date) => {
    // Navigate to dashboard with date filter as URL param
    navigate(`/?date=${date.toISOString()}`);
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Dashboard
        </Button>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Calendário de Solicitações</h1>
        <p className="text-muted-foreground mt-1">Visualize as solicitações por data</p>
      </div>

      <div className="max-w-md">
        <RequestCalendar onDateSelect={handleDateSelect} />
      </div>
    </div>
  );
};

export default Calendar;
