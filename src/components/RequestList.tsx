import { useState, useMemo } from 'react';
import { requests } from '@/data/mockData';
import { RequestCard } from './RequestCard';
import { RequestFilters } from './RequestFilters';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

const ITEMS_PER_PAGE = 10;

export function RequestList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  const filteredRequests = useMemo(() => {
    return requests
      .filter((req) => {
        if (selectedGroup !== 'all' && req.groupId !== selectedGroup) return false;
        if (selectedCategory !== 'all' && req.category !== selectedCategory) return false;
        if (selectedPriority !== 'all' && req.priority !== selectedPriority) return false;
        return true;
      })
      .sort((a, b) => b.priorityScore - a.priorityScore || b.timestamp.getTime() - a.timestamp.getTime());
  }, [selectedGroup, selectedCategory, selectedPriority]);

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const priorityCounts = useMemo(() => ({
    high: requests.filter(r => r.priority === 'high').length,
    medium: requests.filter(r => r.priority === 'medium').length,
    low: requests.filter(r => r.priority === 'low').length,
  }), []);

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-priority-high bg-card">
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
        <Card className="p-4 border-l-4 border-l-priority-medium bg-card">
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
        <Card className="p-4 border-l-4 border-l-priority-low bg-card">
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
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <RequestFilters
          selectedGroup={selectedGroup}
          selectedCategory={selectedCategory}
          selectedPriority={selectedPriority}
          onGroupChange={(v) => { setSelectedGroup(v); handleFilterChange(); }}
          onCategoryChange={(v) => { setSelectedCategory(v); handleFilterChange(); }}
          onPriorityChange={(v) => { setSelectedPriority(v); handleFilterChange(); }}
        />
        <p className="text-sm text-muted-foreground">
          {filteredRequests.length} solicitações encontradas
        </p>
      </div>

      {/* Request list */}
      <div className="space-y-3">
        {paginatedRequests.map((request) => (
          <RequestCard key={request.id} request={request} />
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