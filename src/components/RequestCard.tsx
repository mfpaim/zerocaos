import { ExternalLink, Clock, Trash2, ChevronDown } from 'lucide-react';
import { Request, Category, Priority, RequestType, Status, categoryLabels, priorityLabels, requestTypeLabels } from '@/types/requests';
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
  compact?: boolean;
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

const allCategories: Category[] = [
  'elevador', 'agua', 'gas', 'portao', 'iluminacao', 
  'barulho', 'boleto', 'animais', 'limpeza', 'outros'
];

const allPriorities: Priority[] = ['high', 'medium', 'low'];
const allRequestTypes: RequestType[] = ['reclamacao', 'sugestao', 'solicitacao'];

const statusFlow: { status: Status; label: string; shortLabel: string }[] = [
  { status: 'pendente', label: 'Pendente', shortLabel: 'P' },
  { status: 'em_andamento', label: 'Em Andamento', shortLabel: 'A' },
  { status: 'respondido', label: 'Respondido', shortLabel: 'R' },
  { status: 'resolvido', label: 'Resolvido', shortLabel: '✓' },
];

export function RequestCard({ request, onFilterChange, compact }: RequestCardProps) {
  const timeAgo = getTimeAgo(request.timestamp);
  const { archiveRequest, updateCategory, updatePriority, updateRequestType, updateStatus } = useRequests();

  const handleFilterClick = (type: string, value: string) => {
    onFilterChange?.({ type, value });
  };

  const currentStatusIndex = statusFlow.findIndex(s => s.status === request.status);

  return (
    <Card className={cn(
      "border-l-4 p-4 transition-all hover:shadow-md bg-request-card-bg",
      priorityBorderStyles[request.priority],
      request.status === 'resolvido' && "opacity-60"
    )}>
      {/* Top row: left tags + right status flow */}
      <div className="flex items-start justify-between gap-3 mb-2">
        {/* Left: Category, Priority, Type tags */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full">
                <Badge className={cn("text-primary-foreground cursor-pointer hover:opacity-80 flex items-center gap-1", categoryColors[request.category])}>
                  {categoryLabels[request.category]}
                  <ChevronDown className="h-3 w-3" />
                </Badge>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {allCategories.map((cat) => (
                <DropdownMenuItem key={cat} onClick={() => updateCategory(request.id, cat)} className={cn("cursor-pointer", request.category === cat && "bg-accent")}>
                  <span className={cn("w-3 h-3 rounded-full mr-2", categoryColors[cat])} />
                  {categoryLabels[cat]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Priority */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full">
                <Badge variant="outline" className={cn("cursor-pointer hover:opacity-80 flex items-center gap-1", priorityBadgeStyles[request.priority])}>
                  {priorityLabels[request.priority]}
                  <ChevronDown className="h-3 w-3" />
                </Badge>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {allPriorities.map((prio) => (
                <DropdownMenuItem key={prio} onClick={() => updatePriority(request.id, prio)} className={cn("cursor-pointer", request.priority === prio && "bg-accent")}>
                  <span className={cn("w-3 h-3 rounded-full mr-2", prio === 'high' && "bg-priority-high", prio === 'medium' && "bg-priority-medium", prio === 'low' && "bg-priority-low")} />
                  {priorityLabels[prio]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Request Type */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full">
                <Badge variant="outline" className={cn("cursor-pointer hover:opacity-80 flex items-center gap-1", requestTypeColors[request.requestType])}>
                  {requestTypeLabels[request.requestType]}
                  <ChevronDown className="h-3 w-3" />
                </Badge>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {allRequestTypes.map((type) => (
                <DropdownMenuItem key={type} onClick={() => updateRequestType(request.id, type)} className={cn("cursor-pointer", request.requestType === type && "bg-accent")}>
                  {requestTypeLabels[type]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right: Status Flow */}
        <div className="flex items-center gap-0.5 bg-muted/50 rounded-full p-0.5 shrink-0">
          {statusFlow.map((item, index) => {
            const isActive = request.status === item.status;
            const isPassed = index < currentStatusIndex;
            return (
              <button
                key={item.status}
                onClick={() => updateStatus(request.id, item.status)}
                title={item.label}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-full transition-all",
                  "hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                  isActive && index === 0 && "bg-gray-400 text-white",
                  isActive && index === 1 && "bg-yellow-500 text-white",
                  isActive && index === 2 && "bg-blue-500 text-white",
                  isActive && index === 3 && "bg-green-500 text-white",
                  !isActive && isPassed && "bg-muted text-muted-foreground/70",
                  !isActive && !isPassed && "bg-transparent text-muted-foreground hover:bg-muted"
                )}
              >
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Group & Sender */}
      <div className="text-sm text-muted-foreground mb-1">
        <button className="font-medium text-foreground hover:text-primary hover:underline" onClick={() => handleFilterClick('group', request.groupId)}>
          {request.groupName}
        </button>
        <span className="mx-2">•</span>
        <button className="hover:text-primary hover:underline" onClick={() => handleFilterClick('sender', request.senderName)}>
          {request.senderName}
        </button>
      </div>

      {/* Message */}
      <p className="text-foreground line-clamp-2">{request.message}</p>

      {/* Bottom row: time left, actions right */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{timeAgo}</span>
        </div>

        {/* Actions: Ver Mensagem + Arquivar */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={request.messageLink} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" />
              Ver mensagem
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => archiveRequest(request.id)}
            className="text-muted-foreground hover:text-destructive"
            title="Arquivar (mensagem irrelevante)"
          >
            <Trash2 className="h-4 w-4 mr-1" />
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
