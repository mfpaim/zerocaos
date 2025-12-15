import { ExternalLink, Clock } from 'lucide-react';
import { Request, categoryLabels, priorityLabels } from '@/types/requests';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RequestCardProps {
  request: Request;
}

const priorityStyles = {
  high: 'border-l-priority-high bg-priority-high-bg',
  medium: 'border-l-priority-medium bg-priority-medium-bg',
  low: 'border-l-priority-low bg-priority-low-bg',
};

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

export function RequestCard({ request }: RequestCardProps) {
  const timeAgo = getTimeAgo(request.timestamp);

  return (
    <Card className={cn(
      "border-l-4 p-4 transition-all hover:shadow-md",
      priorityStyles[request.priority]
    )}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge className={cn("text-primary-foreground", categoryColors[request.category])}>
              {categoryLabels[request.category]}
            </Badge>
            <Badge variant="outline" className={cn(priorityBadgeStyles[request.priority])}>
              {priorityLabels[request.priority]}
            </Badge>
          </div>

          {/* Group & Sender */}
          <div className="text-sm text-muted-foreground mb-1">
            <span className="font-medium text-foreground">{request.groupName}</span>
            <span className="mx-2">•</span>
            <span>{request.senderName}</span>
          </div>

          {/* Message */}
          <p className="text-foreground line-clamp-2">{request.message}</p>

          {/* Time */}
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{timeAgo}</span>
          </div>
        </div>

        {/* Action */}
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          asChild
        >
          <a href={request.messageLink} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-1" />
            Ver mensagem
          </a>
        </Button>
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