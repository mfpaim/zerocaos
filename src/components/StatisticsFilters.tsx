import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Calendar, Building2 } from 'lucide-react';
import { DateRange, dateRangeLabels } from '@/hooks/useStatistics';
import { Group } from '@/types/requests';

interface StatisticsFiltersProps {
  selectedGroup: string;
  setSelectedGroup: (value: string) => void;
  dateRange: DateRange;
  setDateRange: (value: DateRange) => void;
  groups: Group[];
}

const StatisticsFilters = ({
  selectedGroup,
  setSelectedGroup,
  dateRange,
  setDateRange,
  groups,
}: StatisticsFiltersProps) => {
  return (
    <Card className="p-4 bg-card mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Date Range Filter */}
        <div className="flex-1">
          <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Período
          </label>
          <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(dateRangeLabels) as DateRange[]).map((range) => (
                <SelectItem key={range} value={range}>
                  {dateRangeLabels[range]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Group Filter */}
        <div className="flex-1">
          <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Grupo
          </label>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Selecione o grupo" />
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
        </div>
      </div>
    </Card>
  );
};

export default StatisticsFilters;
