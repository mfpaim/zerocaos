import { Archive, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRequests } from '@/hooks/useRequests';
import { categoryLabels, priorityLabels } from '@/types/requests';
import { cn } from '@/lib/utils';

const priorityBadgeStyles = {
  high: 'bg-priority-high text-primary-foreground',
  medium: 'bg-priority-medium text-foreground',
  low: 'bg-priority-low text-primary-foreground',
};

const categoryColors: Record<string, string> = {
  elevador: 'bg-category-elevador',
  agua: 'bg-category-agua',
  gas: 'bg-category-gas',
  portao: 'bg-category-portao',
  iluminacao: 'bg-category-iluminacao',
  barulho: 'bg-category-barulho',
  boleto: 'bg-category-boleto',
  animais: 'bg-category-animais',
  limpeza: 'bg-category-limpeza',
  outros: 'bg-category-outros',
};

export default function Archived() {
  const { getArchivedRequests, deleteRequest } = useRequests();
  const archivedRequests = getArchivedRequests();

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Archive className="h-8 w-8 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Arquivados</h1>
          <p className="text-muted-foreground">Solicitações arquivadas</p>
        </div>
      </div>

      {archivedRequests.length === 0 ? (
        <Card className="p-8 text-center">
          <Archive className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Nenhuma solicitação arquivada</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {archivedRequests.map((request) => (
            <Card key={request.id} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge className={cn("text-primary-foreground", categoryColors[request.category])}>
                      {categoryLabels[request.category]}
                    </Badge>
                    <Badge variant="outline" className={cn(priorityBadgeStyles[request.priority])}>
                      {priorityLabels[request.priority]}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    <span className="font-medium text-foreground">{request.groupName}</span>
                    <span className="mx-2">•</span>
                    <span>{request.senderName}</span>
                  </div>
                  <p className="text-foreground line-clamp-2">{request.message}</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteRequest(request.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Apagar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
