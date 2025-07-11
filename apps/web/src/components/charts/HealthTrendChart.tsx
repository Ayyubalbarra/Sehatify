import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HealthTrendData {
  date: string;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  heartRate: number;
  weight: number;
}

interface HealthTrendChartProps {
  data: HealthTrendData[];
  metric: 'bloodPressure' | 'heartRate' | 'weight';
}

const HealthTrendChart: React.FC<HealthTrendChartProps> = ({ data, metric }) => {
  const getChartConfig = () => {
    switch (metric) {
      case 'bloodPressure':
        return {
          title: 'Blood Pressure Trend',
          lines: [
            { dataKey: 'bloodPressureSystolic', stroke: '#ef4444', name: 'Systolic' },
            { dataKey: 'bloodPressureDiastolic', stroke: '#f97316', name: 'Diastolic' }
          ],
          unit: 'mmHg'
        };
      case 'heartRate':
        return {
          title: 'Heart Rate Trend',
          lines: [
            { dataKey: 'heartRate', stroke: '#2dd4bf', name: 'Heart Rate' }
          ],
          unit: 'bpm'
        };
      case 'weight':
        return {
          title: 'Weight Trend',
          lines: [
            { dataKey: 'weight', stroke: '#8b5cf6', name: 'Weight' }
          ],
          unit: 'kg'
        };
      default:
        return {
          title: 'Health Trend',
          lines: [],
          unit: ''
        };
    }
  };

  const config = getChartConfig();

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-text mb-4">{config.title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            stroke="#64748b"
            fontSize={12}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: number) => [`${value} ${config.unit}`, '']}
          />
          {config.lines.map((line, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.stroke}
              strokeWidth={2}
              dot={{ fill: line.stroke, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: line.stroke, strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HealthTrendChart;