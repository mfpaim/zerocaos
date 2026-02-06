import { useState, useMemo } from 'react';
import { RequestFilters } from '@/components/RequestFilters';
import { SearchBar, SearchFilters } from '@/components/SearchBar';
import { DateDivider } from '@/components/DateDivider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, CheckCheck, ExternalLink, Clock, RotateCcw, User, CalendarCheck } from 'lucide-react';
import { useRequests } from '@/hooks/useRequests';
import { categoryLabels, priorityLabels, requestTypeLabels } from '@/types/requests';
import { cn } from '@/lib/utils';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ITEMS_PER_PAGE = 10;

const priorityBorderStyles = {
  high: 'border-l-priority-high',
  medium: 'border-l-priority-medium',
  low: 'border-l-priority-low',
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

const priorityBadgeStyles = {
  high: 'bg-priority-high text-primary-foreground',
  medium: 'bg-priority-medium text-foreground',
  low: 'bg-priority-low text-primary-foreground',
};

export default function Resolvidos() {
  const { getActiveRequests, updateStatus } = useRequests();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedRequestType, setSelectedRequestType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    text: '',
    group: 'all',
    sender: 'all',
    includeResolved: true,
    includeArchived: false,
  });

  // Get all requests (not just active) and filter for resolved
  const { requests } = useRequests();

  const resolvedRequests = useMemo(() => {
    return requests
      .filter((req) => {
        if (req.status !== 'resolvido') return false;

        if (searchFilters.text) {
          const searchLower = searchFilters.text.toLowerCase();
          const matchesText =
            req.message.toLowerCase().includes(searchLower) ||
            req.senderName.toLowerCase().includes(searchLower) ||
            req.groupName.toLowerCase().includes(searchLower);
          if (!matchesText) return false;
        }

        if (searchFilters.group !== 'all' && req.groupId !== searchFilters.group) return false;
        if (searchFilters.sender !== 'all' && req.senderName !== searchFilters.sender) return false;
        if (selectedGroup !== 'all' && searchFilters.group === 'all' && req.groupId !== selectedGroup) return false;
        if (selectedCategory !== 'all' && req.category !== selectedCategory) return false;
        if (selectedPriority !== 'all' && req.priority !== selectedPriority) return false;
        if (selectedRequestType !== 'all' && req.requestType !== selectedRequestType) return false;

        return true;
      })
      .sort((a, b) => {
        // Most recently resolved first
        const aTime = a.resolvedAt?.getTime() ?? a.timestamp.getTime();
        const bTime = b.resolvedAt?.getTime() ?? b.timestamp.getTime();
        return bTime - aTime;
      });
  }, [requests, searchFilters, selectedGroup, selectedCategory, selectedPriority, selectedRequestType]);

  const totalPages = Math.ceil(resolvedRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = resolvedRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const requestsWithDividers = useMemo(() => {
    const items: { type: 'divider' | 'request'; date?: Date; request?: typeof paginatedRequests[0] }[] = [];
    let lastDate: string | null = null;

    paginatedRequests.forEach((request) => {
      const dateKey = format(request.resolvedAt ?? request.timestamp, 'yyyy-MM-dd');
      if (dateKey !== lastDate) {
        items.push({ type: 'divider', date: request.resolvedAt ?? request.timestamp });
        lastDate = dateKey;
      }
      items.push({ type: 'request', request });
    });

    return items;
  }, [paginatedRequests]);

  const handleFilterChange = () => setCurrentPage(1);

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setCurrentPage(1);
  };

  const handleReopen = (id: string) => {
    updateStatus(id, 'pendente');
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
          <CheckCheck className="h-7 w-7 text-green-500" />
          Resolvidos
        </h1>
        <p className="text-muted-foreground mt-1">
          Solicitações concluídas — {resolvedRequests.length} {resolvedRequests.length === 1 ? 'item' : 'itens'}
        </p>
      </div>

      <div className="space-y-6">
        <SearchBar onSearch={handleSearch} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <RequestFilters
            selectedGroup={selectedGroup}
            selectedCategory={selectedCategory}
            selectedPriority={selectedPriority}
            selectedRequestType={selectedRequestType}
            selectedStatus={selectedStatus}
            onGroupChange={(v) => { setSelectedGroup(v); handleFilterChange(); }}
            onCategoryChange={(v) => { setSelectedCategory(v); handleFilterChange(); }}
            onPriorityChange={(v) => { setSelectedPriority(v); handleFilterChange(); }}
            onRequestTypeChange={(v) => { setSelectedRequestType(v); handleFilterChange(); }}
            onStatusChange={(v) => { setSelectedStatus(v); handleFilterChange(); }}
          />
          <p className="text-sm text-muted-foreground">
            {resolvedRequests.length} resolvidos
          </p>
        </div>

        <div className="space-y-2">
          {requestsWithDividers.map((item, index) =>
            item.type === 'divider' && item.date ? (
              <DateDivider key={`divider-${index}`} date={item.date} />
            ) : item.request ? (
              <ResolvedCard
                key={item.request.id}
                request={item.request}
                onReopen={handleReopen}
              />
            ) : null
          )}
        </div>

        {resolvedRequests.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Nenhuma solicitação resolvida encontrada.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Página {currentPage} de {totalPages}
            </span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResolvedCard({ request, onReopen }: { request: any; onReopen: (id: string) => void }) {
  return (
    <Card className={cn(
      "border-l-4 p-4 bg-request-card-bg opacity-75",
      priorityBorderStyles[request.priority as keyof typeof priorityBorderStyles]
    )}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={cn("text-primary-foreground", categoryColors[request.category])}>
            {categoryLabels[request.category]}
          </Badge>
          <Badge variant="outline" className={cn(priorityBadgeStyles[request.priority as keyof typeof priorityBadgeStyles])}>
            {priorityLabels[request.priority]}
          </Badge>
          <Badge variant="outline" className="bg-green-500/20 text-green-700 border-green-300">
            ✓ Resolvido
          </Badge>
        </div>
      </div>

      <div className="text-sm text-muted-foreground mb-1">
        <span className="font-medium text-foreground">{request.groupName}</span>
        <span className="mx-2">•</span>
        <span>{request.senderName}</span>
      </div>

      <p className="text-foreground line-clamp-2 mb-2">{request.message}</p>

      {/* Resolved info */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-3 bg-muted/50 rounded-md px-3 py-2">
        {request.resolvedBy && (
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            Resolvido por: <strong>{request.resolvedBy}</strong>
          </span>
        )}
        {request.resolvedAt && (
          <span className="flex items-center gap-1">
            <CalendarCheck className="h-3 w-3" />
            {format(request.resolvedAt, "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Criado: {format(request.timestamp, "d MMM yyyy", { locale: ptBR })}</span>
        </div>

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
            onClick={() => onReopen(request.id)}
            className="text-muted-foreground hover:text-primary"
            title="Reabrir solicitação"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reabrir
          </Button>
        </div>
      </div>
    </Card>
  );
}
