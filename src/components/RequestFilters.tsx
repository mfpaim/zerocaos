import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category, Priority, RequestType, categoryLabels, priorityLabels, requestTypeLabels } from '@/types/requests';
import { groups } from '@/data/mockData';

interface RequestFiltersProps {
  selectedGroup: string;
  selectedCategory: string;
  selectedPriority: string;
  selectedRequestType: string;
  onGroupChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onRequestTypeChange: (value: string) => void;
}

export function RequestFilters({
  selectedGroup,
  selectedCategory,
  selectedPriority,
  selectedRequestType,
  onGroupChange,
  onCategoryChange,
  onPriorityChange,
  onRequestTypeChange,
}: RequestFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Select value={selectedGroup} onValueChange={onGroupChange}>
        <SelectTrigger className="w-[180px] bg-card">
          <SelectValue placeholder="Todos os grupos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os grupos</SelectItem>
          {groups.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              {group.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[160px] bg-card">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas categorias</SelectItem>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedPriority} onValueChange={onPriorityChange}>
        <SelectTrigger className="w-[140px] bg-card">
          <SelectValue placeholder="Prioridade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="high">{priorityLabels.high}</SelectItem>
          <SelectItem value="medium">{priorityLabels.medium}</SelectItem>
          <SelectItem value="low">{priorityLabels.low}</SelectItem>
        </SelectContent>
      </Select>

      <Select value={selectedRequestType} onValueChange={onRequestTypeChange}>
        <SelectTrigger className="w-[150px] bg-card">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos tipos</SelectItem>
          <SelectItem value="reclamacao">{requestTypeLabels.reclamacao}</SelectItem>
          <SelectItem value="sugestao">{requestTypeLabels.sugestao}</SelectItem>
          <SelectItem value="solicitacao">{requestTypeLabels.solicitacao}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}