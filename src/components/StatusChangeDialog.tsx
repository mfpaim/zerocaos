import { useState } from 'react';
import { Status } from '@/types/requests';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

const statusLabelsMap: Record<Status, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em Andamento',
  respondido: 'Respondido',
  resolvido: 'Resolvido',
};

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: Status;
  currentComment?: string;
  onConfirm: (comment: string) => void;
}

export function StatusChangeDialog({
  open,
  onOpenChange,
  status,
  currentComment = '',
  onConfirm,
}: StatusChangeDialogProps) {
  const [comment, setComment] = useState(currentComment);
  const [showResolvedConfirm, setShowResolvedConfirm] = useState(false);

  const isResolvido = status === 'resolvido';

  const handleSubmit = () => {
    if (isResolvido) {
      setShowResolvedConfirm(true);
    } else {
      onConfirm(comment);
      onOpenChange(false);
      setComment('');
    }
  };

  const handleResolvedConfirm = () => {
    setShowResolvedConfirm(false);
    onConfirm(comment);
    onOpenChange(false);
    setComment('');
  };

  const handleCancel = () => {
    onOpenChange(false);
    setComment('');
  };

  return (
    <>
      <Dialog open={open && !showResolvedConfirm} onOpenChange={(v) => {
        if (!v) handleCancel();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Status: {statusLabelsMap[status]}</DialogTitle>
            <DialogDescription>
              Adicione um comentário sobre esta alteração de status.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Comentário (opcional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px]"
            maxLength={500}
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {isResolvido ? 'Marcar como Resolvido' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showResolvedConfirm} onOpenChange={setShowResolvedConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Resolução</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja marcar esta solicitação como resolvida? Ela será movida para a página de Resolvidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowResolvedConfirm(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleResolvedConfirm}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
