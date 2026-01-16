
import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { Endpoint, EndpointStatus } from '../types';
import { StatusBadge } from './StatusBadge';

interface EndpointCardProps {
  endpoint: Endpoint;
}

export const EndpointCard: React.FC<EndpointCardProps> = ({ endpoint }) => {
  const isOnline = endpoint.status === EndpointStatus.ONLINE;
  const isChecking = endpoint.status === EndpointStatus.CHECKING;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all p-4 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded uppercase tracking-widest">{endpoint.type}</span>
          </div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate">{endpoint.name}</h2>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 font-mono mt-0.5 truncate">{endpoint.url}</p>
        </div>
        <StatusBadge status={endpoint.status} />
      </div>

      {!isChecking && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 dark:bg-slate-800/30 rounded-xl p-2 text-center">
              <p className="text-[8px] text-gray-400 uppercase font-black mb-0.5">Latency</p>
              <p className="text-xs font-bold text-gray-800 dark:text-white">{endpoint.avgLatency}ms</p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800/30 rounded-xl p-2 text-center">
              <p className="text-[8px] text-gray-400 uppercase font-black mb-0.5">Uptime</p>
              <p className="text-xs font-bold text-gray-800 dark:text-white">{endpoint.uptime}%</p>
            </div>
          </div>

          <div className="h-12 w-full mt-1 opacity-70">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={endpoint.history}>
                <Line 
                  type="monotone" 
                  dataKey="latency" 
                  stroke={isOnline ? "#10b981" : "#ef4444"} 
                  strokeWidth={1.5} 
                  dot={false}
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {isChecking && (
        <div className="py-6 flex flex-col items-center justify-center">
          <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mb-2" />
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Awaiting Verification...</span>
        </div>
      )}

      <div className="flex justify-between items-center pt-2 border-t border-gray-50 dark:border-slate-800">
        <span className="text-[8px] font-black text-gray-300 dark:text-slate-600 uppercase">Sentinel Check: {endpoint.lastChecked.toLocaleTimeString()}</span>
        <button className="text-[9px] text-indigo-500 font-black uppercase tracking-tighter hover:underline">Inspect Node</button>
      </div>
    </div>
  );
};
