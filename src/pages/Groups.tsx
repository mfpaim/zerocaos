import { useState } from 'react';
import { groups, requests } from '@/data/mockData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { Group } from '@/types/requests';
import GroupMembersDialog from '@/components/GroupMembersDialog';

const Groups = () => {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const groupStats = groups.map((group) => {
    const groupRequests = requests.filter((r) => r.groupId === group.id);
    const highPriority = groupRequests.filter((r) => r.priority === 'high').length;
    return { ...group, highPriority, totalRequests: groupRequests.length };
  });

  const handleMembersClick = (group: Group) => {
    setSelectedGroup(group);
    setDialogOpen(true);
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Grupos</h1>
        <p className="text-muted-foreground mt-1">Grupos de WhatsApp monitorados</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-4 bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{groups.length}</p>
              <p className="text-sm text-muted-foreground">Total de Grupos</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-priority-low-bg">
              <CheckCircle className="h-5 w-5 text-priority-low" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{groups.filter((g) => g.isActive).length}</p>
              <p className="text-sm text-muted-foreground">Grupos Ativos</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{requests.length}</p>
              <p className="text-sm text-muted-foreground">Total de Solicitações</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Groups list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groupStats.map((group) => (
          <Card key={group.id} className="p-5 bg-card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground">{group.name}</h3>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant={group.isActive ? 'default' : 'secondary'}>
                    {group.isActive ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Ativo</>
                    ) : (
                      <><XCircle className="h-3 w-3 mr-1" /> Inativo</>
                    )}
                  </Badge>
                  {group.highPriority > 0 && (
                    <Badge className="bg-priority-high text-primary-foreground">
                      {group.highPriority} urgente{group.highPriority > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                {/* Members count - clickable */}
                <button
                  onClick={() => handleMembersClick(group)}
                  className="flex items-center gap-1.5 mt-3 text-sm text-muted-foreground hover:text-sidebar-brand-start transition-colors group"
                >
                  <Users className="h-4 w-4 group-hover:text-sidebar-brand-start transition-colors" />
                  <span className="font-medium">{group.members.length}</span>
                  <span>participante{group.members.length !== 1 ? 's' : ''}</span>
                </button>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-foreground">{group.totalRequests}</p>
                <p className="text-sm text-muted-foreground">solicitações</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Members Dialog */}
      {selectedGroup && (
        <GroupMembersDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          groupName={selectedGroup.name}
          members={selectedGroup.members}
        />
      )}
    </div>
  );
};

export default Groups;