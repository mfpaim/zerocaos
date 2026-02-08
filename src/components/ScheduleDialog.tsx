import { useState } from 'react';
import { CalendarPlus, Clock, User, StickyNote } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CalendarDays } from 'lucide-react';

// Mock users for multi-user system
export const systemUsers = [
  { id: '1', name: 'Administrador' },
  { id: '2', name: 'João Silva' },
  { id: '3', name: 'Maria Santos' },
  { id: '4', name: 'Carlos Oliveira' },
  { id: '5', name: 'Ana Costa' },
];

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestSummary: string;
  onConfirm: (data: { assignedTo: string; scheduledDate: Date; scheduledTime: string; note?: string }) => void;
}

export function ScheduleDialog({ open, onOpenChange, requestSummary, onConfirm }: ScheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [assignedTo, setAssignedTo] = useState('');
  const [note, setNote] = useState('');
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  const handleConfirm = () => {
    if (!selectedDate || !assignedTo) return;
    onConfirm({
      assignedTo,
      scheduledDate: selectedDate,
      scheduledTime: selectedTime,
      note: note.trim() || undefined,
    });
    // Reset
    setNote('');
    setAssignedTo('');
    setSelectedDate(new Date());
    setSelectedTime('09:00');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-primary" />
            Agendar no Calendário
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Request summary */}
          <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground line-clamp-2">
            {requestSummary}
          </div>

          {/* Assign to user */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Atribuir a
            </Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o responsável" />
              </SelectTrigger>
              <SelectContent>
                {systemUsers.map(u => (
                  <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date picker */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Data
            </Label>
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecione a data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => { setSelectedDate(date); setDatePopoverOpen(false); }}
                  locale={ptBR}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time picker */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horário
            </Label>
            <Input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            />
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <StickyNote className="h-4 w-4" />
              Observação (opcional)
            </Label>
            <Textarea
              placeholder="Adicione uma observação..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={!selectedDate || !assignedTo}>
            <CalendarPlus className="h-4 w-4 mr-1" />
            Agendar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
