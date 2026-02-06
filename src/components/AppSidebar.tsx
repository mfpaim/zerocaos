import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, Menu, X, Archive, CalendarDays, MessageCircle, Columns3, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { groups } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { useRequests } from '@/hooks/useRequests';
import { UserProfile } from '@/components/UserProfile';
import { useUser } from '@/hooks/useUser';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Calendário', href: '/calendario', icon: CalendarDays },
  { name: 'Grupos', href: '/grupos', icon: Users },
  { name: 'Estatísticas', href: '/estatisticas', icon: BarChart3 },
  { name: 'Kanban', href: '/kanban', icon: Columns3 },
  { name: 'Resolvidos', href: '/resolvidos', icon: CheckCheck },
  { name: 'Fale com seus Dados', href: '/chat', icon: MessageCircle },
  { name: 'Arquivados', href: '/arquivados', icon: Archive },
];

export function AppSidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { archivedIds } = useRequests();
  const { user, updateUser } = useUser();

  const totalRequests = groups.reduce((acc, g) => acc + g.requestCount, 0);

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border bg-gradient-to-br from-[hsl(var(--sidebar-brand-start)/0.08)] to-[hsl(var(--sidebar-brand-end)/0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-[hsl(142_40%_50%)] to-[hsl(197_71%_52%)] bg-clip-text text-transparent">Blue</span><span className="text-sidebar-primary">Sky</span>
              </h1>
              <p className="text-sm text-sidebar-foreground/60 mt-1">Gestão de Demandas</p>
            </div>
            <UserProfile user={user} onUserUpdate={updateUser} />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                    : "hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
                {item.name === 'Dashboard' && (
                  <span className={cn(
                    "ml-auto text-xs px-2 py-0.5 rounded-full",
                    isActive 
                      ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground" 
                      : "bg-sidebar-accent text-sidebar-foreground/60"
                  )}>
                    {totalRequests}
                  </span>
                )}
                {item.name === 'Arquivados' && archivedIds.size > 0 && (
                  <span className={cn(
                    "ml-auto text-xs px-2 py-0.5 rounded-full",
                    isActive 
                      ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground" 
                      : "bg-sidebar-accent text-sidebar-foreground/60"
                  )}>
                    {archivedIds.size}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Groups quick list */}
        <div className="p-4 border-t border-sidebar-border">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 mb-3">
            Grupos Ativos
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
            {groups.filter(g => g.isActive).map((group) => (
              <div 
                key={group.id} 
                className="flex items-center justify-between text-sm text-sidebar-foreground/70"
              >
                <span className="truncate">{group.name}</span>
                <span className="text-xs bg-sidebar-accent px-2 py-0.5 rounded">
                  {group.requestCount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
