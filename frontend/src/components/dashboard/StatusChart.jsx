import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardBody } from '../common/Card';

const COLORS = {
  Available: '#10b981', // emerald-500
  Assigned: '#6366f1',  // indigo-500
  Maintenance: '#f59e0b', // amber-500
  Retired: '#64748b',   // slate-500
};

export const StatusChart = ({ data = [] }) => {
  const chartData = data.filter((d) => d.count > 0);

  return (
    <Card className="h-full">
      <CardHeader
        title="Assets by Status"
        subtitle="Inventory allocation breakdown"
      />
      <CardBody className="h-[280px]">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No status data recorded
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="count"
                nameKey="status"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.status}`}
                    fill={COLORS[entry.status] || '#94a3b8'}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  );
};
