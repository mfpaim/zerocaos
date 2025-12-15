import { ExternalLink, Clock, Check, Archive } from 'lucide-react';
import { Request, categoryLabels, priorityLabels } from '@/types/requests';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRequests } from '@/hooks/useRequests';

interface RequestCardProps {
  request: Request;
  onFilterChange?: (filter: { type: string; value: string }) => void;
}

const priorityStyles = {
  high: 'border-l-priority-high bg-priority-high-bg',
  medium: 'border-l-priority-medium bg-priority-medium-bg',
  low: 'border-l-priority-low bg-priority-low-bg',
};

const priorityBadgeStyles = {
  high: 'bg-priority-high text-primary-foreground cursor-pointer hover:opacity-80',
  medium: 'bg-priority-medium text-foreground cursor-pointer hover:opacity-80',
  low: 'bg-priority-low text-primary-foreground cursor-pointer hover:opacity-80',
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

export function RequestCard({ request, onFilterChange }: RequestCardProps) {
  const timeAgo = getTimeAgo(request.timestamp);
  const { markAsResolved, archiveRequest, resolvedIds } = useRequests();
  const isResolved = resolvedIds.has(request.id);

  const handleFilterClick = (type: string, value: string) => {
    if (onFilterChange) {
      onFilterChange({ type, value });
    }
  };

  return (
    <Card className={cn(
      "border-l-4 p-4 transition-all hover:shadow-md",
      priorityStyles[request.priority],
      isResolved && "opacity-60"
    )}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge 
              className={cn("text-primary-foreground cursor-pointer hover:opacity-80", categoryColors[request.category])}
              onClick={() => handleFilterClick('category', request.category)}
            >
              {categoryLabels[request.category]}
            </Badge>
            <Badge 
              variant="outline" 
              className={cn(priorityBadgeStyles[request.priority])}
              onClick={() => handleFilterClick('priority', request.priority)}
            >
              {priorityLabels[request.priority]}
            </Badge>
            {isResolved && (
              <Badge variant="outline" className="bg-priority-low/20 text-priority-low border-priority-low">
                Resolvido
              </Badge>
            )}
          </div>

          {/* Group & Sender */}
          <div className="text-sm text-muted-foreground mb-1">
            <button 
              className="font-medium text-foreground hover:text-primary hover:underline"
              onClick={() => handleFilterClick('group', request.groupId)}
            >
              {request.groupName}
            </button>
            <span className="mx-2">•</span>
            <button 
              className="hover:text-primary hover:underline"
              onClick={() => handleFilterClick('sender', request.senderName)}
            >
              {request.senderName}
            </button>
          </div>

          {/* Message */}
          <p className="text-foreground line-clamp-2">{request.message}</p>

          {/* Time */}
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{timeAgo}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a href={request.messageLink} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" />
              Ver mensagem
            </a>
          </Button>
          <Button
            variant={isResolved ? "default" : "outline"}
            size="sm"
            onClick={() => markAsResolved(request.id)}
            className={cn(isResolved && "bg-priority-low hover:bg-priority-low/90")}
          >
            <Check className="h-4 w-4 mr-1" />
            {isResolved ? 'Resolvido' : 'Respondido'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => archiveRequest(request.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Archive className="h-4 w-4 mr-1" />
            Arquivar
          </Button>
        </div>
      </div>
    </Card>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays === 1) return 'Ontem';
  return `${diffDays} dias atrás`;
}
