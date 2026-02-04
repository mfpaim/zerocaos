import { ExternalLink, Clock, Check, Archive, ChevronDown } from 'lucide-react';
import { Request, Category, Priority, categoryLabels, priorityLabels } from '@/types/requests';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRequests } from '@/hooks/useRequests';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RequestCardProps {
  request: Request;
  onFilterChange?: (filter: { type: string; value: string }) => void;
}

const priorityBorderStyles = {
  high: 'border-l-priority-high',
  medium: 'border-l-priority-medium',
  low: 'border-l-priority-low',
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

const allCategories: Category[] = [
  'elevador', 'agua', 'gas', 'portao', 'iluminacao', 
  'barulho', 'boleto', 'animais', 'limpeza', 'outros'
];

const allPriorities: Priority[] = ['high', 'medium', 'low'];

export function RequestCard({ request, onFilterChange }: RequestCardProps) {
  const timeAgo = getTimeAgo(request.timestamp);
  const { markAsResolved, archiveRequest, resolvedIds, updateCategory, updatePriority } = useRequests();
  const isResolved = resolvedIds.has(request.id);

  const handleFilterClick = (type: string, value: string) => {
    if (onFilterChange) {
      onFilterChange({ type, value });
    }
  };

  const handleCategoryChange = (category: Category) => {
    updateCategory(request.id, category);
  };

  const handlePriorityChange = (priority: Priority) => {
    updatePriority(request.id, priority);
  };

  return (
    <Card className={cn(
      "border-l-4 p-4 transition-all hover:shadow-md bg-request-card-bg",
      priorityBorderStyles[request.priority],
      isResolved && "opacity-60"
    )}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {/* Editable Category Badge */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full">
                  <Badge 
                    className={cn(
                      "text-primary-foreground cursor-pointer hover:opacity-80 flex items-center gap-1",
                      categoryColors[request.category]
                    )}
                  >
                    {categoryLabels[request.category]}
                    <ChevronDown className="h-3 w-3" />
                  </Badge>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {allCategories.map((cat) => (
                  <DropdownMenuItem
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={cn(
                      "cursor-pointer",
                      request.category === cat && "bg-accent"
                    )}
                  >
                    <span className={cn(
                      "w-3 h-3 rounded-full mr-2",
                      categoryColors[cat]
                    )} />
                    {categoryLabels[cat]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Editable Priority Badge */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "cursor-pointer hover:opacity-80 flex items-center gap-1",
                      priorityBadgeStyles[request.priority]
                    )}
                  >
                    {priorityLabels[request.priority]}
                    <ChevronDown className="h-3 w-3" />
                  </Badge>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {allPriorities.map((prio) => (
                  <DropdownMenuItem
                    key={prio}
                    onClick={() => handlePriorityChange(prio)}
                    className={cn(
                      "cursor-pointer",
                      request.priority === prio && "bg-accent"
                    )}
                  >
                    <span className={cn(
                      "w-3 h-3 rounded-full mr-2",
                      prio === 'high' && "bg-priority-high",
                      prio === 'medium' && "bg-priority-medium",
                      prio === 'low' && "bg-priority-low"
                    )} />
                    {priorityLabels[prio]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

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
