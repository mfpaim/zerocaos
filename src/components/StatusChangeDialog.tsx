import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Status } from '@/types/requests';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
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
  comments?: string[];
  onConfirm: (comment: string) => void;
  onDeleteComment?: (index: number) => void;
  mode: 'add' | 'view';
}

export function StatusChangeDialog({
  open,
  onOpenChange,
  status,
  comments = [],
  onConfirm,
  onDeleteComment,
  mode,
}: StatusChangeDialogProps) {
  const [comment, setComment] = useState('');
  const [showResolvedConfirm, setShowResolvedConfirm] = useState(false);

  const isResolvido = status === 'resolvido';

  const handleSubmit = () => {
    if (mode === 'add' && isResolvido) {
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
              {mode === 'view'
                ? `Comentários para o status "${statusLabelsMap[status]}".`
                : 'Adicione um comentário sobre esta alteração de status.'}
            </DialogDescription>
          </DialogHeader>

          {/* Existing comments */}
          {comments.length > 0 && (
            <ScrollArea className={cn("rounded-md border", comments.length > 3 ? "h-40" : "")}>
              <div className="p-3 space-y-2">
                {comments.map((c, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 rounded-md bg-muted/50 p-2 text-sm">
                    <span className="flex-1 text-foreground">{c}</span>
                    {onDeleteComment && (
                      <button
                        onClick={() => onDeleteComment(i)}
                        className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                        title="Apagar comentário"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Add comment textarea */}
          <Textarea
            placeholder="Comentário (opcional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[80px]"
            maxLength={500}
          />

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            {mode === 'add' ? (
              <Button onClick={handleSubmit}>
                {isResolvido ? 'Marcar como Resolvido' : 'Confirmar'}
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!comment.trim()}>
                Adicionar comentário
              </Button>
            )}
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
