// apps/admin/frontend/src/components/charts/HealthTrendChart.tsx

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// PERBAIKAN: Sesuaikan HealthTrendData agar sesuai dengan ChartDataForRecharts
interface HealthTrendData {
  name: string; // Menggunakan 'name' seperti ChartDataForRecharts
  value: number; // Menggunakan 'value' seperti ChartDataForRecharts
  [key: string]: any; 
}

interface HealthTrendChartProps {
  data: HealthTrendData[]; // Sekarang ini sesuai dengan ChartDataForRecharts
  title: string;
  dataKey?: string; 
  strokeColor?: string; 
}

const HealthTrendChart: React.FC<HealthTrendChartProps> = ({ data, title, dataKey = "value", strokeColor = "#3B82F6" }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 h-full">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" // Gunakan dataKey="name" untuk Recharts
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
            formatter={(value: number) => [`${value}`, title.includes("Kunjungan") ? 'Kunjungan' : '']} 
          />
          <Line
            type="monotone"
            dataKey={dataKey} 
            stroke={strokeColor}
            strokeWidth={2}
            dot={{ fill: strokeColor, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: strokeColor, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HealthTrendChart;