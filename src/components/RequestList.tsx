import { useState, useMemo } from 'react';
import { RequestCard } from './RequestCard';
import { RequestFilters } from './RequestFilters';
import { SearchBar, SearchFilters } from './SearchBar';
import { DateDivider } from './DateDivider';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, AlertTriangle, AlertCircle, CheckCircle, CheckCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRequests } from '@/hooks/useRequests';
import { format, isSameDay } from 'date-fns';

const ITEMS_PER_PAGE = 10;

interface RequestListProps {
  filterDate?: Date | null;
}

export function RequestList({ filterDate }: RequestListProps) {
  const { requests, getActiveRequests, getArchivedRequests, resolvedIds, archivedIds, resolvedCount } = useRequests();
  const activeRequests = getActiveRequests();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedRequestType, setSelectedRequestType] = useState('all');
  const [selectedSender, setSelectedSender] = useState('all');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    text: '',
    group: 'all',
    sender: 'all',
    includeResolved: false,
    includeArchived: false,
  });

  const filteredRequests = useMemo(() => {
    let baseRequests = [...activeRequests];

    // Include resolved and archived based on search filters
    if (searchFilters.includeArchived) {
      const archivedReqs = getArchivedRequests();
      baseRequests = [...baseRequests, ...archivedReqs];
    }

    return baseRequests
      .filter((req) => {
        // Date filter
        if (filterDate && !isSameDay(req.timestamp, filterDate)) return false;
        
        // Text search
        if (searchFilters.text) {
          const searchLower = searchFilters.text.toLowerCase();
          const matchesText = 
            req.message.toLowerCase().includes(searchLower) ||
            req.senderName.toLowerCase().includes(searchLower) ||
            req.groupName.toLowerCase().includes(searchLower);
          if (!matchesText) return false;
        }

        // Search bar filters (take priority if set)
        if (searchFilters.group !== 'all' && req.groupId !== searchFilters.group) return false;
        if (searchFilters.sender !== 'all' && req.senderName !== searchFilters.sender) return false;

        // Standard filters
        if (selectedGroup !== 'all' && searchFilters.group === 'all' && req.groupId !== selectedGroup) return false;
        if (selectedCategory !== 'all' && req.category !== selectedCategory) return false;
        if (selectedPriority !== 'all' && req.priority !== selectedPriority) return false;
        if (selectedRequestType !== 'all' && req.requestType !== selectedRequestType) return false;
        if (selectedSender !== 'all' && searchFilters.sender === 'all' && req.senderName !== selectedSender) return false;

        // Only hide resolved if not including them
        if (!searchFilters.includeResolved && resolvedIds.has(req.id) && !filterDate) {
          // Show resolved in date view but can hide in normal view
        }

        return true;
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [activeRequests, selectedGroup, selectedCategory, selectedPriority, selectedRequestType, selectedSender, searchFilters, filterDate, resolvedIds, getArchivedRequests]);

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Group requests by date for dividers
  const requestsWithDividers = useMemo(() => {
    const items: { type: 'divider' | 'request'; date?: Date; request?: typeof paginatedRequests[0] }[] = [];
    let lastDate: string | null = null;

    paginatedRequests.forEach((request) => {
      const dateKey = format(request.timestamp, 'yyyy-MM-dd');
      if (dateKey !== lastDate) {
        items.push({ type: 'divider', date: request.timestamp });
        lastDate = dateKey;
      }
      items.push({ type: 'request', request });
    });

    return items;
  }, [paginatedRequests]);

  const priorityCounts = useMemo(() => ({
    high: activeRequests.filter(r => r.priority === 'high').length,
    medium: activeRequests.filter(r => r.priority === 'medium').length,
    low: activeRequests.filter(r => r.priority === 'low').length,
  }), [activeRequests]);

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleCardFilterChange = (filter: { type: string; value: string }) => {
    if (filter.type === 'category') {
      setSelectedCategory(filter.value);
    } else if (filter.type === 'priority') {
      setSelectedPriority(filter.value);
    } else if (filter.type === 'group') {
      setSelectedGroup(filter.value);
    } else if (filter.type === 'sender') {
      setSelectedSender(filter.value);
    } else if (filter.type === 'requestType') {
      setSelectedRequestType(filter.value);
    }
    setCurrentPage(1);
  };

  const clearSenderFilter = () => {
    setSelectedSender('all');
    setCurrentPage(1);
  };

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} />

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className={`p-4 border-l-4 border-l-priority-high bg-card cursor-pointer transition-all hover:shadow-md ${selectedPriority === 'high' ? 'ring-2 ring-priority-high' : ''}`}
          onClick={() => { setSelectedPriority(selectedPriority === 'high' ? 'all' : 'high'); handleFilterChange(); }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-priority-high-bg">
              <AlertTriangle className="h-5 w-5 text-priority-high" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{priorityCounts.high}</p>
              <p className="text-sm text-muted-foreground">Alta Prioridade</p>
            </div>
          </div>
        </Card>
        <Card 
          className={`p-4 border-l-4 border-l-priority-medium bg-card cursor-pointer transition-all hover:shadow-md ${selectedPriority === 'medium' ? 'ring-2 ring-priority-medium' : ''}`}
          onClick={() => { setSelectedPriority(selectedPriority === 'medium' ? 'all' : 'medium'); handleFilterChange(); }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-priority-medium-bg">
              <AlertCircle className="h-5 w-5 text-priority-medium" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{priorityCounts.medium}</p>
              <p className="text-sm text-muted-foreground">Média Prioridade</p>
            </div>
          </div>
        </Card>
        <Card 
          className={`p-4 border-l-4 border-l-priority-low bg-card cursor-pointer transition-all hover:shadow-md ${selectedPriority === 'low' ? 'ring-2 ring-priority-low' : ''}`}
          onClick={() => { setSelectedPriority(selectedPriority === 'low' ? 'all' : 'low'); handleFilterChange(); }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-priority-low-bg">
              <CheckCircle className="h-5 w-5 text-priority-low" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{priorityCounts.low}</p>
              <p className="text-sm text-muted-foreground">Baixa Prioridade</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-primary bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CheckCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{resolvedCount}</p>
              <p className="text-sm text-muted-foreground">Resolvidos</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <RequestFilters
            selectedGroup={selectedGroup}
            selectedCategory={selectedCategory}
            selectedPriority={selectedPriority}
            selectedRequestType={selectedRequestType}
            onGroupChange={(v) => { setSelectedGroup(v); handleFilterChange(); }}
            onCategoryChange={(v) => { setSelectedCategory(v); handleFilterChange(); }}
            onPriorityChange={(v) => { setSelectedPriority(v); handleFilterChange(); }}
            onRequestTypeChange={(v) => { setSelectedRequestType(v); handleFilterChange(); }}
          />
          {selectedSender !== 'all' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={clearSenderFilter}
              className="gap-1"
            >
              Remetente: {selectedSender}
              <span className="ml-1">×</span>
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {filteredRequests.length} solicitações encontradas
        </p>
      </div>

      {/* Request list with date dividers */}
      <div className="space-y-2">
        {requestsWithDividers.map((item, index) => 
          item.type === 'divider' && item.date ? (
            <DateDivider key={`divider-${index}`} date={item.date} />
          ) : item.request ? (
            <RequestCard 
              key={item.request.id} 
              request={item.request} 
              onFilterChange={handleCardFilterChange}
            />
          ) : null
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
