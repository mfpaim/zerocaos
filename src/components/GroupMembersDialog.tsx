import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subDays, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Users, Calendar, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GroupMember } from '@/types/requests';

interface GroupMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  members: GroupMember[];
}

const GroupMembersDialog = ({
  open,
  onOpenChange,
  groupName,
  members,
}: GroupMembersDialogProps) => {
  const [dateFilter, setDateFilter] = useState<string>('all');
  const navigate = useNavigate();

  const filteredMembers = useMemo(() => {
    let filtered = [...members];

    if (dateFilter !== 'all') {
      const daysAgo = parseInt(dateFilter);
      const cutoffDate = subDays(new Date(), daysAgo);
      filtered = filtered.filter((member) =>
        isAfter(new Date(member.lastActivity), cutoffDate)
      );
    }

    // Sort by participation count (descending)
    return filtered.sort((a, b) => b.participationCount - a.participationCount);
  }, [members, dateFilter]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getParticipationBadge = (count: number) => {
    if (count >= 10) {
      return (
        <Badge className="bg-sidebar-brand-start/20 text-sidebar-brand-start border-sidebar-brand-start/30">
          Muito ativo
        </Badge>
      );
    }
    if (count >= 5) {
      return (
        <Badge className="bg-sidebar-brand-end/20 text-sidebar-brand-end border-sidebar-brand-end/30">
          Ativo
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-muted-foreground">
        Regular
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-sidebar-brand-start" />
            Participantes - {groupName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrar por período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo o período</SelectItem>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="14">Últimos 14 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Members count */}
          <p className="text-sm text-muted-foreground">
            {filteredMembers.length} participante{filteredMembers.length !== 1 ? 's' : ''} encontrado{filteredMembers.length !== 1 ? 's' : ''}
          </p>

          {/* Members list */}
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {filteredMembers.map((member, index) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium w-6">
                    #{index + 1}
                  </div>
                  <Avatar className="h-10 w-10 border-2 border-sidebar-brand-start/20">
                    <AvatarFallback className="bg-gradient-to-br from-sidebar-brand-start/20 to-sidebar-brand-end/20 text-foreground font-medium">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-medium text-foreground truncate cursor-pointer hover:text-primary hover:underline"
                      onClick={() => { onOpenChange(false); navigate(`/morador/${encodeURIComponent(member.name)}`); }}
                    >
                      {member.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      <span>{member.participationCount} participações</span>
                      <span>•</span>
                      <span>
                        Último: {format(new Date(member.lastActivity), "dd MMM", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  {getParticipationBadge(member.participationCount)}
                </div>
              ))}

              {filteredMembers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum participante encontrado neste período</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupMembersDialog;
