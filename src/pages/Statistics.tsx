import { Card } from '@/components/ui/card';
import { categoryLabels } from '@/types/requests';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Calendar, PieChartIcon } from 'lucide-react';
import { useStatistics } from '@/hooks/useStatistics';
import StatisticsFilters from '@/components/StatisticsFilters';
import ResponseTimeChart from '@/components/ResponseTimeChart';

const COLORS = [
  'hsl(0, 84%, 60%)',      // elevador
  'hsl(199, 89%, 48%)',    // agua
  'hsl(25, 95%, 53%)',     // gas
  'hsl(262, 83%, 58%)',    // portao
  'hsl(45, 93%, 47%)',     // iluminacao
  'hsl(280, 68%, 60%)',    // barulho
  'hsl(142, 71%, 45%)',    // boleto
  'hsl(330, 81%, 60%)',    // animais
  'hsl(173, 80%, 40%)',    // limpeza
  'hsl(220, 9%, 46%)',     // outros
];

const Statistics = () => {
  const {
    selectedGroup,
    setSelectedGroup,
    dateRange,
    setDateRange,
    getRequestsByDay,
    getRequestsByCategory,
    getAverageResponseTimeByPriority,
    stats,
    groups,
  } = useStatistics();

  const selectedGroupName = selectedGroup === 'all' 
    ? 'Todos os grupos' 
    : groups.find(g => g.id === selectedGroup)?.name || 'Grupo';

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Estatísticas</h1>
        <p className="text-muted-foreground mt-1">
          {selectedGroupName} • Visão geral das solicitações
        </p>
      </div>

      {/* Filters */}
      <StatisticsFilters
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        dateRange={dateRange}
        setDateRange={setDateRange}
        groups={groups}
      />

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-4 bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalRequests}</p>
              <p className="text-sm text-muted-foreground">Total de Solicitações</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.avgPerDay}</p>
              <p className="text-sm text-muted-foreground">Média por Dia</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <PieChartIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.mostCommonCategory.name}</p>
              <p className="text-sm text-muted-foreground">Categoria mais comum</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts - First Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar Chart - Requests by Day */}
        <Card className="p-6 bg-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Solicitações por Dia</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getRequestsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                  name="Solicitações"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pie Chart - Category Distribution */}
        <Card className="p-6 bg-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Proporção por Categoria</h3>
          <div className="h-[300px]">
            {getRequestsByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getRequestsByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {getRequestsByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend 
                    formatter={(value) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Nenhuma solicitação no período selecionado
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Response Time Chart - Full Width */}
      <ResponseTimeChart data={getAverageResponseTimeByPriority} />
    </div>
  );
};

export default Statistics;
