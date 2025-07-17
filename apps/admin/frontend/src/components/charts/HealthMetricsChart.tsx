// apps/admin/frontend/src/components/charts/HealthMetricsChart.tsx

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface MetricData {
  name: string;
  value: number;
  color?: string; 
}

interface HealthMetricsChartProps {
  type: 'bar' | 'pie';
  data: MetricData[];
  title: string;
}

const HealthMetricsChart: React.FC<HealthMetricsChartProps> = ({ type, data, title }) => {
  const COLORS = ['#2dd4bf', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#64748b', '#e2e8f0'];

  if (type === 'pie') {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 h-full">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {/* PERBAIKAN SINTAKS: Hapus komentar yang salah */}
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 h-full">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            stroke="#64748b"
            fontSize={12}
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Bar 
            dataKey="value" 
            fill="#2dd4bf"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HealthMetricsChart;