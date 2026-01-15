
import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';
import { Endpoint, EndpointStatus } from '../types';
import { StatusBadge } from './StatusBadge';

interface EndpointCardProps {
  endpoint: Endpoint;
}

export const EndpointCard: React.FC<EndpointCardProps> = ({ endpoint }) => {
  const isOnline = endpoint.status === EndpointStatus.ONLINE;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">{endpoint.type}</h3>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{endpoint.name}</h2>
          <p className="text-xs text-gray-400 dark:text-slate-500 font-mono mt-1 truncate">{endpoint.url}</p>
        </div>
        <StatusBadge status={endpoint.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 my-2">
        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-bold mb-1">Avg Latency</p>
          <p className="text-xl font-bold text-gray-800 dark:text-white">{endpoint.avgLatency}ms</p>
        </div>
        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-bold mb-1">Uptime</p>
          <p className="text-xl font-bold text-gray-800 dark:text-white">{endpoint.uptime}%</p>
        </div>
      </div>

      <div className="h-24 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={endpoint.history}>
            <Tooltip 
              contentStyle={{ fontSize: '12px', borderRadius: '8px', backgroundColor: '#1e293b', border: 'none', color: '#fff' }}
              labelStyle={{ display: 'none' }}
              itemStyle={{ color: '#fff' }}
            />
            <Line 
              type="monotone" 
              dataKey="latency" 
              stroke={isOnline ? "#10b981" : "#ef4444"} 
              strokeWidth={2} 
              dot={false}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-gray-50 dark:border-slate-800">
        <span className="text-[10px] text-gray-400 dark:text-slate-500">Last checked: {endpoint.lastChecked.toLocaleTimeString()}</span>
        <button className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">View Details</button>
      </div>
    </div>
  );
};
