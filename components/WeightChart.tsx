import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { WeightDataPoint } from '../types';

interface WeightChartProps {
  data: WeightDataPoint[];
  goalWeight?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as WeightDataPoint;
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-rose-100 text-left z-50 max-w-[200px]">
        <div className="flex items-baseline space-x-1 mb-2">
          <span className="text-2xl font-black text-rose-500">{data.weight}</span>
          <span className="text-sm font-medium text-gray-400">kg/lbs</span>
        </div>
        <div className="space-y-1">
          {data.phaseName && (
             <p className="text-xs font-bold text-rose-400 uppercase tracking-wider">{data.phaseName}</p>
          )}
          <div className="flex items-center text-gray-600 font-bold text-sm">
             <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-2"></span>
             {data.dayLabel || data.day}
          </div>
          {data.date && (
            <p className="text-xs text-gray-400 mt-1 pt-1 border-t border-gray-100">
              {new Date(data.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          )}
          {data.note && (
            <div className="mt-2 pt-2 border-t border-rose-100 bg-rose-50/50 p-2 rounded-lg">
              <p className="text-xs text-gray-600 italic">"{data.note}"</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const WeightChart: React.FC<WeightChartProps> = ({ data, goalWeight }) => {
  // If no data and no goal, show empty state
  if (data.length === 0 && !goalWeight) {
    return (
      <div className="h-64 flex items-center justify-center bg-white/50 rounded-xl border-2 border-dashed border-rose-200 text-rose-400">
        <p>Log your weight to see the jelly graph!</p>
      </div>
    );
  }

  // Calculate domain to ensure both data points and goal line are visible
  const weights = data.map(d => d.weight);
  const minDataVal = weights.length > 0 ? Math.min(...weights) : (goalWeight || 0);
  const maxDataVal = weights.length > 0 ? Math.max(...weights) : (goalWeight || 100);

  let minDomain = minDataVal - 1;
  let maxDomain = maxDataVal + 1;

  if (goalWeight !== undefined) {
    // Expand domain to include goal line with a bit of padding
    minDomain = Math.min(minDomain, goalWeight - 2);
    maxDomain = Math.max(maxDomain, goalWeight + 2);
  }

  return (
    <div className="h-72 w-full bg-white rounded-xl shadow-sm p-4 border border-rose-100">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffe4e6" />
          <XAxis 
            dataKey="day" 
            tick={{ fontSize: 10, fill: '#888' }} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            domain={[minDomain, maxDomain]} 
            tick={{ fontSize: 10, fill: '#888' }}
            tickLine={false}
            axisLine={false}
            width={30}
          />
          <Tooltip content={<CustomTooltip />} />
          {goalWeight !== undefined && (
            <ReferenceLine 
              y={goalWeight} 
              stroke="#65a30d" 
              strokeDasharray="4 4" 
              strokeWidth={2}
              label={{ 
                position: 'insideBottomRight', 
                value: 'Goal', 
                fill: '#65a30d', 
                fontSize: 12,
                fontWeight: 'bold',
                dy: -10 
              }} 
            />
          )}
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#e11d48"
            strokeWidth={3}
            dot={{ r: 4, fill: '#e11d48', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 8, fill: '#fb7185' }}
            animationDuration={1500}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeightChart;