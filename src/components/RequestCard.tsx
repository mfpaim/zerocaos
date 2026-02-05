import { ExternalLink, Clock, Trash2, ChevronDown } from 'lucide-react';
import { Request, Category, Priority, RequestType, Status, categoryLabels, priorityLabels, requestTypeLabels, statusLabels } from '@/types/requests';
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

const requestTypeColors: Record<RequestType, string> = {
  reclamacao: 'bg-red-500/20 text-red-700 border-red-300',
  sugestao: 'bg-blue-500/20 text-blue-700 border-blue-300',
  solicitacao: 'bg-purple-500/20 text-purple-700 border-purple-300',
};

const statusColors: Record<Status, string> = {
  pendente: 'bg-gray-500/20 text-gray-700 border-gray-300',
  em_andamento: 'bg-yellow-500/20 text-yellow-700 border-yellow-300',
  respondido: 'bg-blue-500/20 text-blue-700 border-blue-300',
  resolvido: 'bg-green-500/20 text-green-700 border-green-300',
};

const allCategories: Category[] = [
  'elevador', 'agua', 'gas', 'portao', 'iluminacao', 
  'barulho', 'boleto', 'animais', 'limpeza', 'outros'
];

const allPriorities: Priority[] = ['high', 'medium', 'low'];

const allRequestTypes: RequestType[] = ['reclamacao', 'sugestao', 'solicitacao'];

const allStatuses: Status[] = ['pendente', 'em_andamento', 'respondido', 'resolvido'];

export function RequestCard({ request, onFilterChange }: RequestCardProps) {
  const timeAgo = getTimeAgo(request.timestamp);
  const { archiveRequest, updateCategory, updatePriority, updateRequestType, updateStatus } = useRequests();

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

  const handleRequestTypeChange = (requestType: RequestType) => {
    updateRequestType(request.id, requestType);
  };

  const handleStatusChange = (status: Status) => {
    updateStatus(request.id, status);
  };

  return (
    <Card className={cn(
      "border-l-4 p-4 transition-all hover:shadow-md bg-request-card-bg",
      priorityBorderStyles[request.priority],
      request.status === 'resolvido' && "opacity-60"
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

            {/* Editable Request Type Badge */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "cursor-pointer hover:opacity-80 flex items-center gap-1",
                      requestTypeColors[request.requestType]
                    )}
                  >
                    {requestTypeLabels[request.requestType]}
                    <ChevronDown className="h-3 w-3" />
                  </Badge>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {allRequestTypes.map((type) => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => handleRequestTypeChange(type)}
                    className={cn(
                      "cursor-pointer",
                      request.requestType === type && "bg-accent"
                    )}
                  >
                    {requestTypeLabels[type]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Editable Status Badge */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "cursor-pointer hover:opacity-80 flex items-center gap-1",
                      statusColors[request.status]
                    )}
                  >
                    {statusLabels[request.status]}
                    <ChevronDown className="h-3 w-3" />
                  </Badge>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {allStatuses.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={cn(
                      "cursor-pointer",
                      request.status === status && "bg-accent"
                    )}
                  >
                    {statusLabels[status]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
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
            variant="ghost"
            size="icon"
            onClick={() => archiveRequest(request.id)}
            className="text-muted-foreground hover:text-destructive h-8 w-8"
            title="Arquivar (mensagem irrelevante)"
          >
            <Trash2 className="h-4 w-4" />
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
