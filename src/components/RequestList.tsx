import { useState, useMemo } from 'react';
import { RequestCard } from './RequestCard';
import { RequestFilters } from './RequestFilters';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, AlertTriangle, AlertCircle, CheckCircle, CheckCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRequests } from '@/hooks/useRequests';

const ITEMS_PER_PAGE = 10;

export function RequestList() {
  const { getActiveRequests, resolvedIds, resolvedCount } = useRequests();
  const activeRequests = getActiveRequests();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedSender, setSelectedSender] = useState('all');

  const filteredRequests = useMemo(() => {
    return activeRequests
      .filter((req) => {
        if (selectedGroup !== 'all' && req.groupId !== selectedGroup) return false;
        if (selectedCategory !== 'all' && req.category !== selectedCategory) return false;
        if (selectedPriority !== 'all' && req.priority !== selectedPriority) return false;
        if (selectedSender !== 'all' && req.senderName !== selectedSender) return false;
        return true;
      })
      .sort((a, b) => b.priorityScore - a.priorityScore || b.timestamp.getTime() - a.timestamp.getTime());
  }, [activeRequests, selectedGroup, selectedCategory, selectedPriority, selectedSender]);

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
    }
    setCurrentPage(1);
  };

  const clearSenderFilter = () => {
    setSelectedSender('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
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
            onGroupChange={(v) => { setSelectedGroup(v); handleFilterChange(); }}
            onCategoryChange={(v) => { setSelectedCategory(v); handleFilterChange(); }}
            onPriorityChange={(v) => { setSelectedPriority(v); handleFilterChange(); }}
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

      {/* Request list */}
      <div className="space-y-3">
        {paginatedRequests.map((request) => (
          <RequestCard 
            key={request.id} 
            request={request} 
            onFilterChange={handleCardFilterChange}
          />
        ))}
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
