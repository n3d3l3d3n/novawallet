
import React from 'react';
import { View, Text } from '../native';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface TradingChartProps {
  data: { value: number, time: string }[];
  color: string;
}

export const TradingChart: React.FC<TradingChartProps> = ({ data, color }) => {
  return (
    <div className="w-full h-48 bg-surface/30 rounded-xl overflow-hidden border border-white/5 relative">
       <div className="absolute top-2 left-3 z-10">
          <Text className="text-[10px] text-slate-500 font-bold uppercase">Price Action (24h)</Text>
       </div>
       <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis 
                dataKey="time" 
                hide={true} 
            />
            <YAxis 
                domain={['auto', 'auto']} 
                hide={true} 
            />
            <Tooltip 
               contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
               itemStyle={{ color: '#fff' }}
               labelStyle={{ display: 'none' }}
               formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              fill="url(#chartGradient)" 
              strokeWidth={2}
            />
          </AreaChart>
       </ResponsiveContainer>
    </div>
  );
};
