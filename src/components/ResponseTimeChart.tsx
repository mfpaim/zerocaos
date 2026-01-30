import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock } from 'lucide-react';

interface ResponseTimeData {
  priority: string;
  name: string;
  avgMinutes: number;
  count: number;
  formatted: string;
}

interface ResponseTimeChartProps {
  data: ResponseTimeData[];
}

const PRIORITY_COLORS = {
  high: 'hsl(0, 84%, 60%)',
  medium: 'hsl(45, 93%, 47%)',
  low: 'hsl(142, 71%, 45%)',
};

const ResponseTimeChart = ({ data }: ResponseTimeChartProps) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">{item.name}</p>
          <p className="text-muted-foreground text-sm">
            Tempo médio: <span className="text-foreground font-medium">{item.formatted}</span>
          </p>
          <p className="text-muted-foreground text-sm">
            Solicitações: <span className="text-foreground font-medium">{item.count}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Tempo Médio de Resposta</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">Por nível de prioridade</p>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
            <XAxis 
              type="number"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => value < 60 ? `${value}m` : `${Math.round(value / 60)}h`}
            />
            <YAxis 
              type="category"
              dataKey="name"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="avgMinutes" 
              radius={[0, 4, 4, 0]}
              name="Tempo médio"
            >
              {data.map((entry) => (
                <Cell 
                  key={entry.priority} 
                  fill={PRIORITY_COLORS[entry.priority as keyof typeof PRIORITY_COLORS]} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 flex-wrap">
        {data.map((item) => (
          <div key={item.priority} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: PRIORITY_COLORS[item.priority as keyof typeof PRIORITY_COLORS] }}
            />
            <span className="text-sm text-muted-foreground">
              {item.name}: <span className="font-medium text-foreground">{item.formatted}</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ResponseTimeChart;
