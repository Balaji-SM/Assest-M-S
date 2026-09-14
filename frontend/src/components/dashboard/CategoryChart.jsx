import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card, CardHeader, CardBody } from '../common/Card';

export const CategoryChart = ({ data = [] }) => {
  return (
    <Card className="h-full">
      <CardHeader
        title="Assets by Category"
        subtitle="Distribution across hardware types"
      />
      <CardBody className="h-[280px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No category data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
              <XAxis
                dataKey="category"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                angle={-25}
                textAnchor="end"
              />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Asset Count" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  );
};
