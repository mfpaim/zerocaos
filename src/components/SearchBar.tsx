import { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { groups } from '@/data/mockData';
import { useRequests } from '@/hooks/useRequests';

export interface SearchFilters {
  text: string;
  group: string;
  sender: string;
  includeResolved: boolean;
  includeArchived: boolean;
}

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

export function SearchBar({ onSearch, initialFilters }: SearchBarProps) {
  const { requests } = useRequests();
  const [text, setText] = useState(initialFilters?.text || '');
  const [group, setGroup] = useState(initialFilters?.group || 'all');
  const [sender, setSender] = useState(initialFilters?.sender || 'all');
  const [includeResolved, setIncludeResolved] = useState(initialFilters?.includeResolved ?? false);
  const [includeArchived, setIncludeArchived] = useState(initialFilters?.includeArchived ?? false);
  const [isOpen, setIsOpen] = useState(false);

  // Get unique senders based on selected group
  const senders = [...new Set(
    requests
      .filter(r => group === 'all' || r.groupId === group)
      .map(r => r.senderName)
  )].sort();

  const handleSearch = () => {
    onSearch({ text, group, sender, includeResolved, includeArchived });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setText('');
    setGroup('all');
    setSender('all');
    setIncludeResolved(false);
    setIncludeArchived(false);
    onSearch({ text: '', group: 'all', sender: 'all', includeResolved: false, includeArchived: false });
  };

  const activeFiltersCount = [
    group !== 'all',
    sender !== 'all',
    includeResolved,
    includeArchived,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por texto, assunto, morador..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
          className="pl-9 pr-9"
        />
        {text && (
          <button
            onClick={() => { setText(''); handleSearch(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Condomínio</label>
              <Select value={group} onValueChange={(v) => { setGroup(v); setSender('all'); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os condomínios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os condomínios</SelectItem>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Morador</label>
              <Select value={sender} onValueChange={setSender}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os moradores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os moradores</SelectItem>
                  {senders.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium block">Incluir na busca</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={includeResolved ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIncludeResolved(!includeResolved)}
                >
                  Resolvidos
                </Button>
                <Button
                  variant={includeArchived ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIncludeArchived(!includeArchived)}
                >
                  Arquivados
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={clearFilters} className="flex-1">
                Limpar
              </Button>
              <Button size="sm" onClick={() => { handleSearch(); setIsOpen(false); }} className="flex-1">
                Aplicar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button onClick={handleSearch}>
        <Search className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">Buscar</span>
      </Button>
    </div>
  );
}
