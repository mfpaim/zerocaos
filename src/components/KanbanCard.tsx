import { useNavigate } from 'react-router-dom';
import { ExternalLink, Trash2, Clock } from 'lucide-react';
import { Request, categoryLabels, priorityLabels, requestTypeLabels } from '@/types/requests';
import { cn } from '@/lib/utils';
import { useRequests } from '@/hooks/useRequests';

interface KanbanCardProps {
  request: Request;
}

const priorityDot: Record<string, string> = {
  high: 'bg-priority-high',
  medium: 'bg-priority-medium',
  low: 'bg-priority-low',
};

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return 'Ontem';
  return `${diffDays}d`;
}

export function KanbanCard({ request }: KanbanCardProps) {
  const { archiveRequest } = useRequests();
  const navigate = useNavigate();

  return (
    <div className={cn(
      "bg-card rounded-md border border-border p-3 transition-all hover:shadow-sm",
      request.status === 'resolvido' && "opacity-60"
    )}>
      {/* Header: group + time */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-foreground truncate">{request.groupName}</span>
        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 shrink-0">
          <Clock className="h-2.5 w-2.5" />
          {getTimeAgo(request.timestamp)}
        </span>
      </div>

      {/* Sender */}
      <p
        className="text-[11px] text-muted-foreground mb-1.5 cursor-pointer hover:text-primary hover:underline"
        onClick={() => navigate(`/morador/${encodeURIComponent(request.senderName)}`)}
      >{request.senderName}</p>

      {/* Message */}
      <p className="text-xs text-foreground/90 line-clamp-2 mb-2 leading-relaxed">{request.message}</p>

      {/* Tags row */}
      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          {categoryLabels[request.category]}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          <span className={cn("w-1.5 h-1.5 rounded-full", priorityDot[request.priority])} />
          {priorityLabels[request.priority]}
        </span>
        <span className="inline-flex text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          {requestTypeLabels[request.requestType]}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1.5 border-t border-border/50 pt-2">
        <a
          href={request.messageLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          <span>Ver</span>
        </a>
        <button
          onClick={() => archiveRequest(request.id)}
          className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-destructive transition-colors"
          title="Arquivar"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
